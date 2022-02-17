type rid_t              is nat

type bid_t              is [@layout:comb] record [
  bid                     : nat;
]

type race_t             is [@layout:comb] record [
  bids                    : map(address, bid_t);
  name                    : string;
  location                : string;
  rid                     : rid_t;
  registration_fee        : nat;
  min_bid                 : nat;
  bid_step                : nat;
]

type storage_t          is [@layout:comb] record [
  races                   : big_map(rid_t, race_t);
  uusd_token              : address;
  randomizer              : address;
  ubinetic                : address;
  admin                   : address;
  pending_admin           : address;
  races_count             : nat;
]

type launch_race_t      is [@layout:comb] record [
  horses                  : nat;
]

type register_horse_t   is [@layout:comb] record [
  rid                     : rid_t;
]

type bet_t              is [@layout:comb] record [
  rid                     : rid_t;
]

type set_admin_t        is address

type confirm_admin_t    is unit

type get_random_t       is [@layout:comb] record [
  _from                    : nat;
  _to                      : nat;
  entropy                  : bytes;
  includeRandomizerEntropy : bool;
]

type action_t           is
(* GAME *)
| Launch_race             of launch_race_t
| Register_horse          of register_horse_t
| Bet                     of bet_t
(* ADMIN *)
| Set_admin               of set_admin_t
| Confirm_admin           of confirm_admin_t

type setup_func_t       is [@layout:comb] record [
  idx                     : nat;
  func_bytes              : bytes;
]

type return_t           is list(operation) * storage_t

type game_func_t        is (action_t * storage_t) -> return_t

type full_storage_t     is [@layout:comb] record [
  storage                 : storage_t;
  game_lambdas            : big_map(nat, bytes);
  metadata                : big_map(string, bytes);
]

type full_return_t      is list(operation) * full_storage_t

type full_action_t      is
| Use                     of action_t
| Setup_func              of setup_func_t

const game_methods_max_index : nat = 4n;
