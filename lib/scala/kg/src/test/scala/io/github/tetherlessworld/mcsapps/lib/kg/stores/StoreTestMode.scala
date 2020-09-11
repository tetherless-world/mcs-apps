package io.github.tetherlessworld.mcsapps.lib.kg.stores

sealed trait StoreTestMode

object StoreTestMode {
  case object ReadOnly extends StoreTestMode
  case object ReadWrite extends StoreTestMode
}
