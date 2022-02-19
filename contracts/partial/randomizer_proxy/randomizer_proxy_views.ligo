[@view] function get_random(
  const params          : get_random_t;
  const s               : storage_t)
                        : nat is
  unwrap(
    (
      Tezos.call_view(
        "getRandomBetweenEntropyBytes",
        ((params._from, params._to), (params.entropy, params.includeRandomizerEntropy)),
        s.randomizer
      ) : option(nat)
    ),
    RandomizerProxy.err_randomizer_get_random_between_entropy_bytes_view_404
  )
