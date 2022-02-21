function mint_token(
  const mintParams      : mint_token_params;
  var s                 : storage)
                        : return is
  block {
    if Set.mem(Tezos.sender, s.free_token) then
      failwith("You-already-got-a-free-horse");
    else block {
      var acc : account := get_account(Tezos.sender, s);
      var token : token_info_t := get_token(Tezos.sender, s.lastTokenId, s.token_info);

      acc.balance[s.lastTokenId] := 1n;
      s.ledger[Tezos.sender] := acc;
      token.name := mintParams.name;
      s.token_info[(Tezos.sender, s.lastTokenId)] := token;
      s.token_metadata[s.lastTokenId] := record [
        token_id = s.lastTokenId;
        extras = mintParams.metadata_param;
      ];
      s.lastTokenId := s.lastTokenId + 1n;
      s.free_token := Set.add (Tezos.sender, s.free_token);
    }
  } with (noOperations, s)

function bet(const params : bet_t; var s : storage) : return is
  block {
    var race : race_t := get_race_info(params.race_id, s.races);
    assert_with_error(
      race.betting_start < Tezos.now,
      Horse.err_bet_betting_part_not_started
    );
    assert_with_error(
      race.participants_count >= params.hrs_id,
      Horse.err_bet_horse_not_found
    );

    // get random
    const epoch : nat = unwrap(
      (
        Tezos.call_view(
          "get_current_epoch",
          unit,
          s.ubinetic_proxy
        ) : option(nat)
      ),
      UbineticProxy.err_ubinetic_get_current_epoch_view_404
    );

    const correct_epoch : nat = sub(epoch, 2n);

    const entropy : bytes = unwrap(
      (
        Tezos.call_view(
          "get_entropy",
          correct_epoch,
          s.ubinetic_proxy
        ) : option(bytes)
      ),
      UbineticProxy.err_ubinetic_get_entropy_view_404
    );

    const random : nat = unwrap(
      (
        Tezos.call_view(
          "get_random",
          (record [
            _from                    = 0n;
            _to                      = 10n;
            entropy                  = entropy;
            includeRandomizerEntropy = False;
          ]),
          s.randomizer_proxy
        ) : option(nat)
      ),
      RandomizerProxy.err_randomizer_get_random_between_entropy_bytes_view_404
    );
    race.random := random;

    var bet : map(horse_id, amt) := get_bets(params.race_id, Tezos.sender, s.bets);
    const token_bet : nat = get_token_bets(params.hrs_id, bet);
    bet[params.hrs_id] := token_bet + params.amt;
    s.bets[(Tezos.sender, params.race_id)] := bet;
    const pool_amt : nat = get_pool(params.race_id ,s.pools);
    s.pools[params.race_id] := pool_amt + params.amt;
    s.races[params.race_id] := race;

    const operations : list(operation) = list[Tezos.transaction(
      list[
        record [
          from_ = Tezos.sender;
          txs = list[
            record[
              to_ = Tezos.self_address;
              token_id = 0n;
              amount = params.amt
            ]
          ]
        ]
      ],
      0mutez,
      getFA2Transfer(s.uusd_token)
    )];

  } with (operations, s)

function claim(const params : claim_t; var s : storage) : return is
  block {
    var acc : account := get_account(Tezos.sender, s);
    var reward_status : bool := get_reward_status(params.race_id, acc.reward);
    const bet : map(horse_id, amt) = get_bets(params.race_id, Tezos.sender, s.bets);
    const race : race_t = get_race_info(params.race_id, s.races);
    const token_bet : amt = get_token_bets(race.random, bet);

    assert_with_error(
      token_bet =/= 0n,
      "not-betted"
    );

    const pool : nat = get_pool(params.race_id, s.pools);
    const admin_fee : nat = pool * 3n / 100n;

    const new_pool : nat = sub(pool, admin_fee);
    const user_percent : nat = token_bet / new_pool * 100n;
    assert_with_error(
      not reward_status,
      "reward-already-paid"
    );
    const user_reward : nat = new_pool * user_percent / 100n;

    reward_status := True;
    acc.reward[params.race_id] := reward_status;
    s.ledger[Tezos.sender] := acc;

    var operations : list(operation) := list[Tezos.transaction(
      list[
        record [
          from_ = Tezos.self_address;
          txs = list[
            record[
              to_ = Tezos.sender;
              token_id = 0n;
              amount = user_reward
            ]
          ]
        ]
      ],
      0mutez,
      getFA2Transfer(s.uusd_token)
    )];

    if not get_reward_status(params.race_id, s.admin_reward_flag)
    then block {
      operations := Tezos.transaction(
        list[
          record [
            from_ = Tezos.self_address;
            txs = list[
              record[
                to_ = s.admin;
                token_id = 0n;
                amount = admin_fee
              ]
            ]
          ]
        ],
        0mutez,
        getFA2Transfer(s.uusd_token)
      ) # operations;

      s.admin_reward_flag[params.race_id] := True
    }
    else skip;

  } with (operations, s)
