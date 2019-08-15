declare module 'elasticlunr' {
  function elasticlunr<T = any>(
    config: (this: elasticlunr.Index<T>) => void
  ): elasticlunr.Index
  namespace elasticlunr {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    type LoopContext = any
    type PluginArg = any
    type SortedSetType = any
    type ToStringObject = any
    type Doc = Record<string, any>
    /* eslint-enable @typescript-eslint/no-explicit-any */
    interface ConfigItem {
      boost?: number
      bool?: 'AND' | 'OR'
      expand?: boolean
    }

    type UserConfig = Record<string, ConfigItem> & ConfigItem

    interface SerializedDocumentStore {
      length: number
      docs: Record<DocRef, Doc | null>
      docInfo: Record<DocRef, Record<string, number>>
      save: boolean
    }

    interface SerializedIndex {
      fields: string[]
      ref: string
      documentStore: SerializedDocumentStore
      pipeline: SerializedPipeline
      index: Record<string, SerializedInvertedIndex>
      version: string
    }

    interface SerializedInvertedIndex {
      root: DocNode
    }

    type SerializedPipeline = string[]

    type DocRef = string | number

    export interface Configuration {
      new (config: string, fields: Record<string, ConfigItem>): Configuration
      buildDefaultConfig(fields: string[]): void
      buildUserConfig(config: UserConfig, fields: string[]): void
      addAllFields2UserConfig(
        bool: string,
        expand: string,
        fields: string[]
      ): void
      get(): Record<string, ConfigItem>
      reset(): void
    }

    export interface DocumentStore {
      new (save?: boolean): DocumentStore
      isDocStored(): boolean
      addDoc(docRef: DocRef, doc: Doc): void
      getDoc(docRef: DocRef): Doc
      hasDoc(docRef: DocRef): boolean
      removeDoc(docRef: DocRef): void
      addFieldLength(docRef: DocRef, fieldName: string, length: number): void
      updateFieldLength(docRef: DocRef, fieldName: string, length: number): void
      getFieldLength(docRef: DocRef, fieldName: string): number
      toJSON(): SerializedDocumentStore
    }

    export interface EventEmitter {
      events: {[eventName: string]: () => void}

      addListener(...eventNamesOrFunction: (string | Function)[]): void
      removeListener(eventName: string, fn: Function): void
      emit(eventName: string): void
    }

    interface SearchResult {
      ref: string
      score: number
    }

    type EventName = 'add' | 'update' | 'remove'

    export interface Index<Doc extends {} = {}> {
      index: Record<keyof Doc, InvertedIndex>
      pipeline: Pipeline
      documentStore: DocumentStore
      eventEmitter: EventEmitter
      on(...eventNamesOrFunction: (EventName | Function)[]): void
      off(eventName: EventName, fn: Function): void
      addField(fieldName: keyof Doc): Index
      setRef(refName: string, emitEvent?: boolean): Index
      saveDocument(save: boolean): Index
      addDoc(doc: Doc, emitEvent?: boolean): void
      removeDocByRef(docRef: DocRef, emitEvent?: boolean): void
      removeDoc(doc: Doc, emitEvent?: boolean): void
      updateDoc(doc: Doc, emitEvent?: boolean): void
      getFields(): (keyof Doc)[]
      search(query: string, userConfig?: UserConfig): SearchResult[]
      fieldSearch(
        queryTokens: string[],
        fieldName: string,
        config: Configuration
      ): Record<keyof Doc, number>
      toJSON(): SerializedIndex
      use(plugin: Plugin): void
    }
    export namespace Index {
      export function load(serializedData: SerializedIndex): Index
    }

    interface DocNode {
      docs: Record<string, number>
      df: number
    }

    interface TokenInfo {
      ref: number
      tf: number
    }

    export interface InvertedIndex {
      new (): InvertedIndex

      addToken(token: string, tokenInfo: TokenInfo, root?: DocNode): void
      hasToken(token: string): boolean
      getNode(token: string): DocNode
      getDocs(token: string): Record<string, number>
      getTermFrequency(token: string, docRef: DocRef): number
      getDocFreq(token: string): number
      removeToken(token: string, ref: string): void
      expandToken(token: string): string[]
      toJSON(): SerializedInvertedIndex
    }
    export namespace InvertedIndex {
      export function load(
        serializedData: SerializedInvertedIndex
      ): InvertedIndex
    }

    export interface Pipeline {
      add(...functions: Function[]): void
      after(existingFn: Function, newFn: Function): void
      before(existingFn: Function, newFn: Function): void
      remove(fn: Function): void
      run(tokens: string[]): string[]
      reset(): void
      get(): Function[]
      toJSON(): SerializedPipeline
    }
    export namespace Pipeline {
      export function load(serialized: SerializedPipeline): Pipeline

      export function registerFunction(fn: Function, label: string): void
      export function getRegisteredFunction(label: string): Function
    }

    export interface SortedSet {
      length: number
      elements: SortedSetType[]
      new (): SortedSet

      add(...args: SortedSetType[]): void
      toArray(): SortedSetType[]
      map(fn: Function, ctx?: LoopContext): SortedSetType[]
      forEach(fn: Function, ctx?: LoopContext): void
      indexOf(elem: SortedSetType): number
      locationFor(elem: SortedSetType): number
      intersect(otherSet: SortedSet): SortedSet
      clone(): SortedSet
      union(otherSet: SortedSet): SortedSet
      toJSON(): SortedSetType[]
    }
    export namespace SortedSet {
      function load(serializedData: SortedSetType[]): SortedSet
    }

    export interface Stemmer {
      (str: string): string
    }

    export type StopWords = Record<string, boolean>

    export interface StopWordFilter {
      (token: string): string | undefined
      stopWords: StopWords
    }

    export interface Tokenizer {
      (str: string): string[]
      defaultSeperator: RegExp
      seperator: RegExp
      setSeperator(sep: RegExp): void
      resetSeperator(): void
      getSeperator(): RegExp
    }

    export interface Trimmer {
      (token: string): string
    }

    export interface Utils {
      warn(message: string): void
      toString(obj: ToStringObject): string
    }

    export interface Plugin {
      (this: Index, idx?: Index, ...args: PluginArg[]): void
      tokenizer: Tokenizer
      stemmer: Stemmer
      trimmer: Trimmer
      stopWordFilter: StopWordFilter
      wordCharacters?: string
    }

    export interface Elasticlunr {
      [x: string]: Plugin
      (config: (this: Index) => void): Index
      version: string
      tokenizer: Tokenizer
      stemmer: Stemmer
      trimmer: Trimmer

      defaultStopWords: Record<string, boolean>
      stopWordFilter: StopWordFilter
      clearStopWords(): void
      addStopWords(words: string[]): void
      resetStopWords(): void

      utils: Utils

      stemmerSupport?: Record<string, Function>
      trimmerSupport?: Record<string, Function>
      multiLanguage?: (...languages: string[]) => void
    }
    const version: string
    const tokenizer: Tokenizer
    const stemmer: Stemmer
    const trimmer: Trimmer

    const defaultStopWords: Record<string, boolean>
    const stopWordFilter: StopWordFilter
    function clearStopWords(): void
    function addStopWords(words: string[]): void
    function resetStopWords(): void

    const utils: Utils
  }
  export default elasticlunr
}
