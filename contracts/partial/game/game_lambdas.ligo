(* GAME *)

function launch_race(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Launch_race(_params) -> {
        skip;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

function register_horse(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Register_horse(_params) -> {
        skip;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

function bet(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Bet(_params) -> {
        skip;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

(* ADMIN *)

function set_admin(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Set_admin(admin) -> {
        only_admin(s.admin);

        s.pending_admin := admin;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

function confirm_admin(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Confirm_admin -> {
        only_pending_admin(s.pending_admin);

        s.admin := s.pending_admin;
        s.pending_admin := Constants.zero_address;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

// const current_epoch : nat = get_current_epoch(s.ubinetic);
// const entropy: bytes = get_entropy(abs(current_epoch - 2n), s.ubinetic);

// s.current_epoch := current_epoch;
// s.entropy := entropy;

// const params : get_random_t = record [
//   _from                    = 0n;
//   _to                      = 100n;
//   entropy                  = s.entropy;
//   includeRandomizerEntropy = False;
// ];

// s.random := get_random(params, s.randomizer);
