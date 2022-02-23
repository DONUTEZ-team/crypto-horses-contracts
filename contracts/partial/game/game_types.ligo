type rid_t              is nat

type pid_t              is nat

type hid_t              is nat

type bid_t              is [@layout:comb] record [
  bid                     : nat;
  amt                     : nat;
]

type participant_t      is [@layput:comb] record [
  pid                     : pid_t;
  hid                     : hid_t;
]

type race_t             is [@layout:comb] record [
  bids                    : map(address, bid_t);
  participants            : map(address, participant_t);
  name                    : string;
  location                : string;
  rid                     : rid_t;
  registration_fee        : nat;
  min_bid                 : nat;
  bid_step                : nat;
  max_participants_count  : nat;
  participants_count      : nat;
  registration_start      : timestamp;
  betting_start           : timestamp;
  race_start              : timestamp;
]

type storage_t          is [@layout:comb] record [
  races                   : big_map(rid_t, race_t);
  ledger                  : big_map((address * token_id_t), nat);
  accounts                : big_map((address * token_id_t), account_t);
  token_info              : big_map((address * token_id_t), token_info_t);
  token_metadata          : big_map(token_id_t, map(string, bytes));
  free_token              : set(address);
  uusd_token              : address;
  ubinetic_proxy          : address;
  randomizer_proxy        : address;
  admin                   : address;
  pending_admin           : address;
  races_count             : nat;
  min_registration_period : nat;
  min_betting_period      : nat;
  tokens_count            : nat;
]

type launch_race_t      is [@layout:comb] record [
  name                    : string;
  location                : string;
  registration_fee        : nat;
  min_bid                 : nat;
  bid_step                : nat;
  max_participants_count  : nat;
  registration_start      : timestamp;
  betting_start           : timestamp;
  race_start              : timestamp;
]

type register_horse_t   is [@layout:comb] record [
  rid                     : rid_t;
]

type bet_t              is [@layout:comb] record [
  rid                     : rid_t;
  hid                     : hid_t;
  amt                     : nat;
]

type set_min_register_t is nat

type set_min_betting_t  is nat

type mint_t             is [@layout:comb] record [
  name                    : string;
  token_metadata          : map(string, bytes);
]

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
| Set_min_register_time   of set_min_register_t
| Set_min_betting_time    of set_min_betting_t
(* FA2 *)
| Transfer                of transfers_t
| Update_operators        of update_operators_t
| Balance_of              of balance_of_t
| Mint                    of mint_t

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

const game_methods_max_index : nat = 10n;
