(* GAME *)

function launch_race(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Launch_race(params) -> {
        only_admin(s.admin);

        assert_with_error(
          params.registration_start >= Tezos.now,
          Game.err_too_low_registration_start
        );
        assert_with_error(
          params.betting_start >= params.registration_start + int(s.min_registration_period),
          Game.err_too_low_betting_start
        );
        assert_with_error(
          params.race_start >= params.betting_start + int(s.min_betting_period),
          Game.err_to_low_race_start
        );

        s.races[s.races_count] := record [
          bids                   = (map [] : map(address, bid_t));
          participants           = (map [] : map(address, participant_t));
          name                   = params.name;
          location               = params.location;
          rid                    = s.races_count;
          registration_fee       = params.registration_fee;
          min_bid                = params.min_bid;
          bid_step               = params.bid_step;
          max_participants_count = params.max_participants_count;
          participants_count     = 0n;
          registration_start     = params.registration_start;
          betting_start          = params.betting_start;
          race_start             = params.race_start;
        ];
        s.races_count := s.races_count + 1n;
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

function set_min_register_time(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Set_min_register_time(min_registration_period) -> {
        only_admin(s.admin);

        s.min_registration_period := min_registration_period;
      }
    | _ -> skip
    end
  } with ((nil : list(operation)), s)

function set_min_betting_time(
  const action          : action_t;
  var s                 : storage_t)
                        : return_t is
  block {
    case action of
    | Set_min_betting_time(min_betting_period) -> {
        only_admin(s.admin);

        s.min_betting_period := min_betting_period;
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
