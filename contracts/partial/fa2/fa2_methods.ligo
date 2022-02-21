function get_account(const addr : address; const s : storage) : account is
  block {
    var acc : account := record [
      balance = (map [] : map(token_id, nat));
      allowances = (set [] : set(address));
      reward = (map [] : map(race_id, bool));
    ];

    case s.ledger[addr] of
    | None -> skip
    | Some(a) -> acc := a
    end;
  } with acc

function getFA2Transfer(
  const tokenAddress    : address)
                        : contract(transfer_params) is
  case(
    Tezos.get_entrypoint_opt("%transfer", tokenAddress)
                        : option(contract(transfer_params))
  ) of
    Some(contr) -> contr
    | None -> (
      failwith("token/cant-get-contract-fa2-token") : contract(transfer_params)
    )
  end;

function get_token(const user : address;  const token_id : nat; const token_info : big_map((address * token_id), token_info_t)) : token_info_t is
  case token_info[(user, token_id)] of
    None -> record [
      name                   = "Undefined";
      lvl                    = 0n;
      speed                  = 1n;
      stamina                = 100n;
      age                    = (Tezos.now : timestamp);
      race_counter           = 0n;
      last_race              = (0 : timestamp);
      in_race                = False;
    ]
  | Some(v) -> v
  end

function get_race_info(const rid : nat; const races : big_map(nat, race_t)) : race_t is
  case races[rid] of
    None -> (failwith("race-not-found") : race_t)
  | Some(v) -> v
  end

function get_bets(const rid : nat; const user : address; const bets : big_map((address * race_id), map(horse_id, amt))) : map(horse_id, amt) is
  case bets[(user, rid)] of
    None -> (Map.empty : map(horse_id, amt))
  | Some(v) -> v
  end

function get_token_bets(const hrs_id : nat; const bet : map(horse_id, amt)) : amt is
  case bet[hrs_id] of
    None -> 0n
  | Some(v) -> v
  end

function get_pool(const race_id : nat; const pools : big_map(race_id, nat)) : amt is
  case pools[race_id] of
    None -> 0n
  | Some(v) -> v
  end

function get_reward_status(const race_id : nat; const reward : map(race_id, bool)) : bool is
  case reward[race_id] of
    None -> False
  | Some(v) -> v
  end

function iterate_transfer(var s : storage; const user_trx_params : transfer_param) : storage is
  block {
    function make_transfer(var s : storage; const transfer : transfer_destination) : storage is
      block {
        var sender_account : account := get_account(user_trx_params.from_, s);

        if user_trx_params.from_ = Tezos.sender or sender_account.allowances contains Tezos.sender then
          skip
        else
          failwith("FA2_NOT_OPERATOR");

        var senderBalance : nat := case sender_account.balance[transfer.token_id] of
        | Some(v) -> v
        | None -> 0n
        end;

        if senderBalance < transfer.amount then
          failwith("FA2_INSUFFICIENT_BALANCE")
        else
          skip;

        sender_account.balance[transfer.token_id] := abs(senderBalance - transfer.amount);
        s.ledger[user_trx_params.from_] := sender_account;

        var dest_account : account := get_account(transfer.to_, s);
        const recepientBalance : nat = case dest_account.balance[transfer.token_id] of
        | Some(v) -> v
        | None -> 0n
        end;

        dest_account.balance[transfer.token_id] := recepientBalance + transfer.amount;
        s.ledger[transfer.to_] := dest_account;
      } with s
  } with (List.fold(make_transfer, user_trx_params.txs, s))

function iterate_update_operator(var s : storage; const params : update_operator_param) : storage is
  block {
    case params of
    | Add_operator(param) -> block {
      if Tezos.sender =/= param.owner then
        failwith("FA2_NOT_OWNER")
      else
        skip;

      var sender_account : account := get_account(param.owner, s);

      sender_account.allowances := Set.add(param.operator, sender_account.allowances);
      s.ledger[param.owner] := sender_account;
    }
    | Remove_operator(param) -> block {
      if Tezos.sender =/= param.owner then
        failwith("FA2_NOT_OWNER")
      else
        skip;

      var sender_account : account := get_account(param.owner, s);

      sender_account.allowances := Set.remove(param.operator, sender_account.allowances);
      s.ledger[param.owner] := sender_account;
    }
    end;
  } with s

function get_balance_of(const balance_params : balance_params; const s : storage) : list(operation) is
  block {
    function look_up_balance(const l : list(balance_of_response); const request : balance_of_request) : list(balance_of_response) is
      block {
        const sender_account : account = get_account(request.owner, s);
        const response : balance_of_response = record [
          request = request;
          balance = case sender_account.balance[request.token_id] of
          | Some(v) -> v
          | None -> 0n
          end;
        ];
      } with response # l;

    const accomulated_response : list(balance_of_response) = List.fold(look_up_balance, balance_params.requests, (nil: list(balance_of_response)));
  } with list [transaction(accomulated_response, 0tz, balance_params.callback)]

