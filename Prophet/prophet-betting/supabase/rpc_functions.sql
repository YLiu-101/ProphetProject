-- RPC Functions for Prophet Betting Platform
-- These functions should be executed in your Supabase SQL editor

-- Function 1: Create Market with Bet
CREATE OR REPLACE FUNCTION create_market_with_bet(
  p_title TEXT,
  p_description TEXT,
  p_deadline TIMESTAMP WITH TIME ZONE,
  p_arbitrator_type TEXT,
  p_arbitrator_email TEXT,
  p_market_type TEXT,
  p_creator_id UUID,
  p_stake_amount DECIMAL
) RETURNS JSON AS $$
DECLARE
  v_market_id UUID;
  v_bet_id UUID;
  v_result JSON;
BEGIN
  -- Create market first
  INSERT INTO markets (name, description, type, created_by)
  VALUES (p_title, p_description, p_market_type, p_creator_id)
  RETURNING id INTO v_market_id;
  
  -- Create bet linked to market
  INSERT INTO bets (
    market_id, 
    creator_id, 
    title, 
    description, 
    deadline, 
    arbitrator_type, 
    arbitrator_email,
    minimum_stake
  )
  VALUES (
    v_market_id, 
    p_creator_id, 
    p_title, 
    p_description, 
    p_deadline, 
    p_arbitrator_type, 
    p_arbitrator_email,
    p_stake_amount
  )
  RETURNING id INTO v_bet_id;
  
  -- Give creator initial credits if they don't have any
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  SELECT p_creator_id, 100, 'bonus', 'Welcome bonus'
  WHERE NOT EXISTS (
    SELECT 1 FROM credit_transactions WHERE user_id = p_creator_id
  );
  
  -- Return both IDs
  SELECT json_build_object(
    'market_id', v_market_id,
    'bet_id', v_bet_id
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Place Bet with Credit Verification
CREATE OR REPLACE FUNCTION place_bet(
  p_bet_id UUID,
  p_user_id UUID,
  p_prediction BOOLEAN,
  p_stake_amount DECIMAL
) RETURNS JSON AS $$
DECLARE
  v_current_balance DECIMAL;
  v_participant_id UUID;
  v_result JSON;
BEGIN
  -- Calculate current balance
  SELECT COALESCE(SUM(amount), 0) 
  INTO v_current_balance
  FROM credit_transactions 
  WHERE user_id = p_user_id;
  
  -- Check if user has sufficient credits
  IF v_current_balance < p_stake_amount THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
  
  -- Give new user welcome bonus if they don't have any transactions
  IF v_current_balance = 0 THEN
    INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_user_id, 100, 'bonus', 'Welcome bonus');
    v_current_balance := 100;
  END IF;
  
  -- Re-check after potential bonus
  IF v_current_balance < p_stake_amount THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
  
  -- Create bet participation
  INSERT INTO bet_participants (bet_id, user_id, prediction, stake_amount)
  VALUES (p_bet_id, p_user_id, p_prediction, p_stake_amount)
  RETURNING id INTO v_participant_id;
  
  -- Record credit transaction (debit)
  INSERT INTO credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description, 
    bet_id
  )
  VALUES (
    p_user_id, 
    -p_stake_amount, 
    'bet', 
    'Bet placed', 
    p_bet_id
  );
  
  -- Calculate new balance
  v_current_balance := v_current_balance - p_stake_amount;
  
  -- Return result
  SELECT json_build_object(
    'participant_id', v_participant_id,
    'new_balance', v_current_balance
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Resolve Bet with Payout Distribution
CREATE OR REPLACE FUNCTION resolve_bet(
  p_bet_id UUID,
  p_outcome BOOLEAN,
  p_arbitrator_id UUID,
  p_reasoning TEXT
) RETURNS JSON AS $$
DECLARE
  v_decision_id UUID;
  v_total_stake DECIMAL;
  v_winning_stake DECIMAL;
  v_losing_stake DECIMAL;
  v_total_payout DECIMAL;
  v_winners_count INTEGER;
  v_participant RECORD;
  v_payout_amount DECIMAL;
  v_result JSON;
BEGIN
  -- Create arbitrator decision
  INSERT INTO arbitrator_decisions (
    bet_id, 
    arbitrator_id, 
    outcome, 
    reasoning, 
    decided_at
  )
  VALUES (
    p_bet_id, 
    p_arbitrator_id, 
    p_outcome, 
    p_reasoning, 
    NOW()
  )
  RETURNING id INTO v_decision_id;
  
  -- Calculate total stakes
  SELECT 
    COALESCE(SUM(stake_amount), 0),
    COALESCE(SUM(CASE WHEN prediction = p_outcome THEN stake_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN prediction != p_outcome THEN stake_amount ELSE 0 END), 0),
    COUNT(CASE WHEN prediction = p_outcome THEN 1 END)
  INTO v_total_stake, v_winning_stake, v_losing_stake, v_winners_count
  FROM bet_participants 
  WHERE bet_id = p_bet_id;
  
  -- If no winners, return all stakes
  IF v_winners_count = 0 OR v_winning_stake = 0 THEN
    -- Return stakes to all participants
    FOR v_participant IN 
      SELECT user_id, stake_amount 
      FROM bet_participants 
      WHERE bet_id = p_bet_id
    LOOP
      INSERT INTO credit_transactions (
        user_id, 
        amount, 
        transaction_type, 
        description, 
        bet_id
      )
      VALUES (
        v_participant.user_id, 
        v_participant.stake_amount, 
        'refund', 
        'Bet refund - no winners', 
        p_bet_id
      );
    END LOOP;
    
    v_total_payout := v_total_stake;
  ELSE
    -- Distribute winnings proportionally
    v_total_payout := 0;
    
    FOR v_participant IN 
      SELECT user_id, stake_amount, prediction
      FROM bet_participants 
      WHERE bet_id = p_bet_id AND prediction = p_outcome
    LOOP
      -- Calculate payout: original stake + proportional share of losing stakes
      v_payout_amount := v_participant.stake_amount + 
                        (v_participant.stake_amount * v_losing_stake / v_winning_stake);
      
      INSERT INTO credit_transactions (
        user_id, 
        amount, 
        transaction_type, 
        description, 
        bet_id
      )
      VALUES (
        v_participant.user_id, 
        v_payout_amount, 
        'payout', 
        'Bet winnings', 
        p_bet_id
      );
      
      v_total_payout := v_total_payout + v_payout_amount;
    END LOOP;
  END IF;
  
  -- Mark bet as resolved
  UPDATE bets 
  SET resolved = TRUE, resolved_at = NOW()
  WHERE id = p_bet_id;
  
  -- Return result
  SELECT json_build_object(
    'decision_id', v_decision_id,
    'total_payout', v_total_payout,
    'winners_count', v_winners_count
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
