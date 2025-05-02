## [1.6.0](https://github.com/pcdevil/wordoftheday/compare/v1.5.0...v1.6.0) (2025-05-02)

### Features

* update dependencies ([53a5882](https://github.com/pcdevil/wordoftheday/commit/53a5882379ab92640915faf5a98e836353993864))
* update node and pnpm ([2d37277](https://github.com/pcdevil/wordoftheday/commit/2d37277b679138aff5afc9e4ad492f1220fd16ed))

## [1.5.0](https://github.com/pcdevil/wordoftheday/compare/v1.4.0...v1.5.0) (2025-03-09)

### Features

* update dependencies ([39d36c9](https://github.com/pcdevil/wordoftheday/commit/39d36c9cd53e1f9d2bc0a2a91651872c255b4e0c))

## [1.4.0](https://github.com/pcdevil/wordoftheday/compare/v1.3.0...v1.4.0) (2025-02-11)

### Features

* update node and pnpm ([24e0387](https://github.com/pcdevil/wordoftheday/commit/24e03872cf273f551e6ceb0bb38a53eecc9b6c1d))

## [1.3.0](https://github.com/pcdevil/wordoftheday/compare/v1.2.0...v1.3.0) (2025-01-25)

### Features

* update dependencies ([b76d76e](https://github.com/pcdevil/wordoftheday/commit/b76d76e024bfbb2ebba8256185c9e0c6789b85ad))

## [1.2.0](https://github.com/pcdevil/wordoftheday/compare/v1.1.0...v1.2.0) (2024-12-30)

### Features

* add idempotency key to avoid duplicated posts on repeated runs ([3ddfcce](https://github.com/pcdevil/wordoftheday/commit/3ddfccec1678f261dedad4070754bdecc74e0e95))

## [1.1.0](https://github.com/pcdevil/wordoftheday/compare/v1.0.0...v1.1.0) (2024-12-18)

### Features

* rework github workflows ([78555cb](https://github.com/pcdevil/wordoftheday/commit/78555cb980e2b0df9abc7738db1a13acd22701ac))

## 1.0.0 (2024-12-08)

### Features

* accept word object and hashtag in mastodon poster ([c3748e0](https://github.com/pcdevil/wordoftheday/commit/c3748e00e1d30fda06b713011b0ba71cb493c7b0))
* add ability to change post visibility ([aa4aa07](https://github.com/pcdevil/wordoftheday/commit/aa4aa07d4b08561132935ceb195020577e0c2d9c))
* add asset images ([b7e2664](https://github.com/pcdevil/wordoftheday/commit/b7e2664ed3a18bac5f7d65bc8ec0f7c93ff8d46a))
* add cli runner ([3c5ea9b](https://github.com/pcdevil/wordoftheday/commit/3c5ea9bfc5ec990db41255193dcbd48f8acf8e4c))
* add config module ([2e8e711](https://github.com/pcdevil/wordoftheday/commit/2e8e711204c3ab6caaa9e11e92ab18fe615944ed))
* add error handling to the config module ([35d27c4](https://github.com/pcdevil/wordoftheday/commit/35d27c4014759ceae6e9d89904799aec93905df3))
* add free dictionary site configs ([2841eff](https://github.com/pcdevil/wordoftheday/commit/2841effbddc1dc388e8aae1a9ac3360bfe65007f))
* add item index support for word resolver ([9cb44bd](https://github.com/pcdevil/wordoftheday/commit/9cb44bdfdad8c56e8ab82ea4fedd92f1c59677b1))
* add logger to all modules ([7656124](https://github.com/pcdevil/wordoftheday/commit/76561248e9ca6203af97fa03b964c740e7c3aa9e))
* add mastodon poster ([0cb87c3](https://github.com/pcdevil/wordoftheday/commit/0cb87c393cac4700c041ad12e73ab1c256b813f2))
* add retry on failed status post ([bb50627](https://github.com/pcdevil/wordoftheday/commit/bb50627ff62d6224c71d28c688c55883b2b441f5))
* add word of the day module ([6447653](https://github.com/pcdevil/wordoftheday/commit/6447653d538b1ba05f085f218977e1d4a2ad2b91))
* add word resolver on rss feed ([bc49861](https://github.com/pcdevil/wordoftheday/commit/bc498618a8727c0abaf2c257a15d3bdf5c5135f3))
* create logger factory ([8602cf0](https://github.com/pcdevil/wordoftheday/commit/8602cf09ea3ab8c83a809c6d1858bbb647e9a0b6))
* handle errors in word resolver ([10fbd21](https://github.com/pcdevil/wordoftheday/commit/10fbd2104d6966555ab1381773f8a9cd27b1b4e5))
* handle invalid source name ([c0271c8](https://github.com/pcdevil/wordoftheday/commit/c0271c843f9b2016ccbe39a44134f48568dbeeaf))
* make retries configurable through environment variables ([680de8b](https://github.com/pcdevil/wordoftheday/commit/680de8bac6faeb35665d92f57759f97a3c6172ce))

### Bug Fixes

* handle empty hashtag without repeated spaces in status ([898bf2a](https://github.com/pcdevil/wordoftheday/commit/898bf2a6d8fa859f95c0eab2bf399e5a482ea2dc))
* handle file path argument properly for logger ([b839a52](https://github.com/pcdevil/wordoftheday/commit/b839a5209f7aea3be3c1f632523f25a54fcfddf6))
* read already exposed environment variables in config ([9fc746b](https://github.com/pcdevil/wordoftheday/commit/9fc746b1db59ce5ff3a334aa520d510355ddff4d))
* resolve typo in semantic-release preset name ([169bcde](https://github.com/pcdevil/wordoftheday/commit/169bcde4b9fea598e1c72208ec89e1837a56e922))
* return response on retried requests too ([96eb032](https://github.com/pcdevil/wordoftheday/commit/96eb03259b2e7721aec5aeee559153f977eb03b2))
* turn off oxford learner's dictionaries ([57ecb32](https://github.com/pcdevil/wordoftheday/commit/57ecb32cbf90a59e00ba5d770afec054e67c5c25))
* use fallback value for the correct config ([6645c2f](https://github.com/pcdevil/wordoftheday/commit/6645c2f2ce96b5792678d1b6fe24ce0c54b1912b))
