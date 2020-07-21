package data.kg

// An alias for code that doesn't care whether the data is from the legacy CSKG CSV format or the KGTK format
object TestKgData extends KgData(TestKgtkDataResources)
