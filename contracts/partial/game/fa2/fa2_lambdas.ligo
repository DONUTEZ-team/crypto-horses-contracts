function mint(
  const params          : mint_t;
  var s                 : storage_t)
                        : return_t is
  block {
    if Set.mem(Tezos.sender, s.free_token)
    then failwith(Game.err_user_already_got_a_free_horse);
    else {
      var token : token_info_t := unwrap_or(
        s.token_info[(Tezos.sender, s.tokens_count)],
        Constants.default_token_info
      );

      s.ledger[(Tezos.sender, s.tokens_count)] := 1n;

      token.name := params.name;

      s.token_info[(Tezos.sender, s.tokens_count)] := token;
      s.token_metadata[s.tokens_count] := params.token_metadata;
      s.tokens_count := s.tokens_count + 1n;
      s.free_token := Set.add(Tezos.sender, s.free_token);
    }
  } with ((nil : list(operation)), s)

function iterate_transfer(
  const result          : return_t;
  const transfer_param  : transfer_t)
                        : return_t is
  block {
    function make_transfer(
      var result        : return_t;
      const dst         : transfer_dst_t)
                        : return_t is
      block {
        var ops : list(operation) := result.0;
        var s : storage_t := result.1;

        var sender_acc : account_t :=
          unwrap_or(s.accounts[(transfer_param.from_, dst.token_id)], Constants.default_account);

        if transfer_param.from_ =/= Tezos.sender
          and not (Set.mem(Tezos.sender, sender_acc.allowances))
        then failwith("FA2_NOT_OPERATOR")
        else skip;

        assert_with_error(dst.token_id < s.tokens_count, "FA2_TOKEN_UNDEFINED");

        const sender_balance : nat = unwrap_or(s.ledger[(transfer_param.from_, dst.token_id)], 0n);

        assert_with_error(sender_balance >= dst.amount, "FA2_INSUFFICIENT_BALANCE");

        s.ledger[(transfer_param.from_, dst.token_id)] := get_nat_or_fail(sender_balance - dst.amount);

        const receiver_balance : nat = unwrap_or(s.ledger[(dst.to_, dst.token_id)], 0n);

        s.ledger[(dst.to_, dst.token_id)] := receiver_balance + dst.amount;
      } with (ops, s)
  } with (List.fold(make_transfer, transfer_param.txs, result))

function update_operator(
  var s                 : storage_t;
  const params          : update_operator_t)
                        : storage_t is
  block {
    const (param, should_add) = case params of
    | Add_operator(param)    -> (param, True)
    | Remove_operator(param) -> (param, False)
    end;

    assert_with_error(param.token_id < s.tokens_count, "FA2_TOKEN_UNDEFINED");
    assert_with_error(Tezos.sender = param.owner, "FA2_NOT_OWNER");

    var account : account_t := unwrap_or(s.accounts[(param.owner, param.token_id)], Constants.default_account);

    account.allowances := Set.update(param.operator, should_add, account.allowances);

    s.accounts[(param.owner, param.token_id)] := account;
  } with s

function transfer(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    var result : return_t := ((nil : list(operation)), s);

    case action of
    | Transfer(params) -> {
        result := List.fold(iterate_transfer, params, result);
      }
    | _ -> skip
    end
  } with result

function update_operators(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Update_operators(params) -> {
        s := List.fold(update_operator, params, s);
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

function balance_of(
  const action          : action_t;
  const s               : storage_t)
                        : return_t is
  block {
    var ops : list(operation) := nil;

    case action of
    | Balance_of(params) -> {
        function look_up_balance(
          const l         : list(balance_response_t);
          const request   : balance_request_t)
                          : list(balance_response_t) is
          block {
            assert_with_error(request.token_id < s.tokens_count, "FA2_TOKEN_UNDEFINED");

            const bal : nat = unwrap_or(s.ledger[(request.owner, request.token_id)], 0n);
            const response : balance_response_t = record [
              request = request;
              balance = bal;
            ];
          } with response # l;

        const accumulated_response : list(balance_response_t) = List.fold(
          look_up_balance,
          params.requests,
          (nil : list(balance_response_t))
        );

        ops := Tezos.transaction(accumulated_response, 0mutez, params.callback) # ops;
      }
    | _ -> skip
    end
  } with (ops, s)
