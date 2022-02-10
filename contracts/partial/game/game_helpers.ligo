function get_current_epoch(
  const ubinetic        : address)
                        : nat is
  unwrap(
    (Tezos.call_view("get_current_epoch", Unit, ubinetic) : option(nat)),
    Game.err_ubinetic_get_current_epoch_view_404
  )

function get_entropy(
  const epoch           : nat;
  const ubinetic        : address)
                        : bytes is
  unwrap(
    (Tezos.call_view("get_entropy", epoch, ubinetic) : option(bytes)),
    Game.err_ubinetic_get_entropy_view_404
  )

function get_random(
  const params          : get_random_t;
  const randomizer      : address)
                        : nat is
  unwrap(
    (
      Tezos.call_view(
        "getRandomBetweenEntropyBytes",
        ((params._from, params._to), (params.entropy, params.includeRandomizerEntropy)),
        randomizer
      ) : option(nat)
    ),
    Game.err_randomizer_get_random_between_entropy_bytes_view_404
  )
