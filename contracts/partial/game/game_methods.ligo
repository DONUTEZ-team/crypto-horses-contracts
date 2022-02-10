function bet(
  var s                 : storage_t)
                        : return_t is
  block {
    const current_epoch : nat = get_current_epoch(s.ubinetic);
    const entropy: bytes = get_entropy(abs(current_epoch - 2n), s.ubinetic);

    s.current_epoch := current_epoch;
    s.entropy := entropy;

    const params : get_random_t = record [
      _from                    = 0n;
      _to                      = 100n;
      entropy                  = s.entropy;
      includeRandomizerEntropy = False;
    ];

    s.random := get_random(params, s.randomizer);
  } with ((nil : list(operation)), s)

function default(
  const s               : storage_t)
                        : return_t is
  block {
    skip;
  } with ((nil : list(operation)), s)
