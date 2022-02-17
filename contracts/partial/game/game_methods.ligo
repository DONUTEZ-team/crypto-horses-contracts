function call_game(
  const action          : action_t;
  var s                 : full_storage_t)
                        : full_return_t is
  block {
    const id : nat = case action of
    (* GAME *)
    | Launch_race(_)          -> 0n
    | Register_horse(_)       -> 1n
    | Bet(_)                  -> 2n
    (* ADMIN *)
    | Set_admin(_)            -> 3n
    | Confirm_admin(_)        -> 4n
    end;

    const lambda_bytes : bytes = unwrap(s.game_lambdas[id], Game.err_unknown_func);

    const res : return_t = case (Bytes.unpack(lambda_bytes) : option(game_func_t)) of
    | Some(f) -> f(action, s.storage)
    | None    -> failwith(Game.err_cant_unpack_lambda)
    end;

    s.storage := res.1;
  } with (res.0, s)

function setup_func(
  const params          : setup_func_t;
  var s                 : full_storage_t)
                        : full_return_t is
  block {
    only_admin(s.storage.admin);

    assert_with_error(params.idx <= game_methods_max_index, Game.err_high_func_index);

    case s.game_lambdas[params.idx] of
    | Some(_) -> failwith(Game.err_func_set)
    | None    -> s.game_lambdas[params.idx] := params.func_bytes
    end;
  } with ((nil : list(operation)), s)
