package stores

import java.io.BufferedInputStream

abstract class DataResources {
  protected final def getResourceAsStream(resourceName: String) =
    new BufferedInputStream(getClass.getResourceAsStream(resourceName))
}
