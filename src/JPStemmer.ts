// https://github.com/MrBrickPanda/Bunpou-Pal/blob/master/jpstemmer.py
class JPStemmer {
  private endingList = [
    'ませんでした',
    'ました',
    'ません',
    'ます',
    'ない',
    'なかった'
  ]
  private nAdjEnd = [
    'です',
    'だ',
    'でした',
    'だった',
    'ではありません',
    'ではない',
    'ではありませんでした',
    'ではなかった',
    'じゃない'
  ]
  private iAdjEnd = ['くなかった', 'かった', 'くない']
  private wordList = [
    'わ',
    'か',
    'が',
    'さ',
    'ざ',
    'た',
    'だ',
    'な',

    'ま',
    'は',
    'ば',
    'ぱ',
    'ら',
    'や'
  ]
  private iList = [
    'い',
    'き',
    'ぎ',
    'し',
    'じ',
    'ち',
    'ぢ',
    'に',
    'み',
    'ひ',
    'び',
    'ぴ',
    'り'
  ]
  private uList = [
    'う',
    'く',
    'ぐ',
    'す',
    'ず',
    'つ',
    'づ',
    'ぬ',
    'む',
    'ふ',
    'ぶ',
    'ぷ',
    'る',
    'ゆ'
  ]
  private eList = [
    'え',
    'け',
    'げ',
    'せ',
    'ぜ',
    'て',
    'で',
    'ね',
    'め',
    'へ',
    'べ',
    'ぺ',
    'れ'
  ]
  private oList = [
    'お',
    'こ',
    'ご',
    'そ',
    'ぞ',
    'と',
    'ど',
    'の',
    'も',
    'ほ',
    'ぼ',
    'ぽ',
    'ろ',
    'よ'
  ]
  private tte = [
    'って',
    'った',
    'んで',
    'んだ',
    'いて',
    'いた',
    'きて',
    'いで',
    'いだ',
    'ぎで'
  ]

  // This is the variable containing the word to be stemmed.
  private word = ''
  // wordG is the main variable the algorithm uses to define the word it's processing.
  private wordG = ['']
  // ending is used to store the end characters of a word that need to be removed before conjugation.
  private ending = ''
  // wordType is used to either show that the word is a verb or an adjective. This is used in step1 to make sure
  // verbs don't get conjugated like adjectives and vice-versa.
  private wordType = ''
  // original is a variable to store the unmodified word for future use.
  private original = ''

  public stemmer(input: string): string {
    // """a == the word"""
    this.word = input
    this.original = this.word
    this.word.replace(/(^[.]+)|([.]+$)/g, '') // strip(".")
    // this.goThrough = true;
    this.step1()
    // if self.wordG != ['']:
    if (this.wordG.length > 1 || this.wordG[0] !== '') {
      this.word = this.word.slice(0, this.word.length - this.ending.length) // this.word[:len(this.word) - len(this.ending)]
      if (this.wordType === 'vb') {
        this.step2()
        this.step3()
        this.step4()
        this.step5()
        this.step6()
        this.step7()
        this.step8()
      } else {
        this.step2a()
      }
    }

    return this.word
  }

  /**
   * Checks what kind of verb the word is. If the word is not a verb, nothing happens
   */
  private checkVb(): void {
    // Checks for group 1 & 2verbs in polite present, past, negative, past negative and some plain negative forms
    this.checkEnd()
    this.checkPlain2()
    this.checkPlain1()
    this.checkCond()
    this.checkPot()
    this.checkCause()
    this.checkImp()
    this.checkVol()
    this.checkPass()
    this.checkTe()
  }

  /**
   *  Checks if the word is an adjective
   */
  private checkAdj(): boolean | void {
    // this checks if the word is an adjective, which are easy to tell apart because they always end in い or in the
    // elements of the iAdjEnd list.

    // for i in this.iAdjEnd:
    for (let i of this.iAdjEnd) {
      // It goes through these checks to make sure an adjective is not mistaken for a verb in past plain form.
      // This is checked by looking at the character before "なかった", if it is in this.wordList it is a verb. This
      // is facilitated by the use of .endsWith(), which is used throughout this code to check the end of the word.
      if (this.wordPos(-1) === 'い' && !this.word.endsWith('じゃない')) {
        if (this.wordPos(-2) !== 'な') {
          this.wordG = ['i', 'adjective']
          this.ending = 'い'
          return true
        } else if (this.word.slice(-3) === 'くない') {
          this.wordG = ['i', 'adjective']
          this.ending = 'くない'
          return true
        } else {
          return false
        }
      }
      if (this.word.endsWith(i)) {
        if (this.word.endsWith('かった')) {
          if (!this.word.endsWith('くなかった')) {
            if (this.includes(this.wordList, -4)) {
              return false
            }
          }
        }
        // If this isn't true, it assigns wordG appropriately
        this.wordG = ['i', 'adjective']
        this.ending = i
        return true
      }
      // A check to see if the adjective ends with "じゃな", anther telling of an adjective
      else if (this.word.endsWith('じゃな' + i)) {
        this.wordG = ['i', 'adjective']
        this.ending = 'じゃな' + i
        return true
      }
    }
    for (let i of this.nAdjEnd) {
      if (this.word.endsWith(i)) {
        this.wordG = ['na', 'adjective']
        this.ending = i
      }
    }
  }

  private checkEnd(): void {
    // This function checks the verb for any of the "normal" sentence endings. If the character it's looking for is
    // in one of the letter lists, it assign wordG appropriately.
    for (let i of this.endingList) {
      if (this.word.endsWith(i)) {
        if (this.includes(this.iList, this.original.length - i.length - 1)) {
          if (this.word.endsWith('します')) {
            this.wordG = ['shimasu', 'normal']
            this.ending = 'ます'
          } else {
            this.wordG = ['one', 'normal']
            this.ending = i
          }
        } else if (i === 'ませんでした') {
          this.ending = i
          if (this.includes(this.iList, -i.length - 1)) {
            this.wordG = ['one', 'normal']
            this.ending = i
          } else {
            this.wordG = ['two', 'normal']
            this.ending = i
          }
        } else if (
          this.includes(this.wordList, this.original.length - i.length - 1)
        ) {
          this.wordG = ['one', 'normal']
          this.ending = i
        } else if (
          this.includes(this.eList, this.original.length - i.length - 1)
        ) {
          this.wordG = ['two', 'normal']
          this.ending = i
        }
      }
    }
  }

  private checkCond(): void {
    // Checks for conditional form in both group 1 and two verbs.
    for (let i of this.eList) {
      // if the word ends with an "e" letter and "ば", it assign wordG as "two" and "cond"
      if (this.word.endsWith(i + 'ば')) {
        this.wordG = ['two', 'cond']
        this.ending = 'ば'
      }
      // if it just ends with "ば", it assign wordG as "one" and "cond"
      else if (this.wordPos(-1) === 'ば') {
        this.wordG = ['one', 'cond']
      }
    }
  }

  /**
   * The first function to check for plain form verbs,
   */
  private checkPlain1(): void {
    // Checks for group 1 plain verbs
    if (!this.endingList.includes(this.ending)) {
      if (this.includes(this.uList, this.original.length - 1)) {
        for (let i of this.wordList) {
          if (this.word.endsWith(i + 'れる')) {
            this.wordG = ['one', 'pot']
            this.ending = 'れる'
          }
        }
      }
      if (this.word.endsWith('られる')) {
        this.wordG = ['two', 'pot']
        this.ending = 'られる'
      } else {
        if (this.wordG.length === 0) {
          this.wordG = ['one', 'normal']
          this.ending = ''
        }
      }
    }
  }

  /**
   * This is the second function to check for plain verbs, and specifically group 2 verbs.
   */
  private checkPlain2(): void {
    // Verbs with two characters inclusive of る are always group 2.
    if (this.original.length === 2 && this.word[1] === 'る') {
      this.wordG = ['two', 'normal']
      this.ending = 'る'
    }
    // Checks for group 2 plain verbs
    else if (
      this.word[this.original.length - 1] === 'る' &&
      this.includes(this.eList, this.original.length - 2) &&
      !this.includes(this.wordList, this.original.length - 3)
    ) {
      this.wordG = ['two', 'normal']
      this.ending = 'る'
      this.ending = this.word[this.original.length - 1]
    }
  }

  /**
   * Checks for causative form
   */
  private checkCause(): void {
    // If the words ends in an "e" letter and "せる", wordG is assigned as "two" and "cause"
    if (this.word.endsWith('せる')) {
      if (this.includes(this.eList, -4)) {
        this.wordG = ['two', 'cause']
        this.ending = this.wordPos(-4) + 'せる'
      }
      // if the word ends in sn "a" letter and "せる, wordG is assigned as "one" and "cause".
      else if (this.includes(this.wordList, -3)) {
        this.wordG = ['one', 'cause']
        this.ending = 'せる'
      }
    }
  }

  private checkPot(): void {
    // Checks for potential form
    // Group 2 potential and passive forms are conjugated the same way, so this will work for both
    if (this.word.endsWith('られる')) {
      this.wordG = ['two', 'pot']
      this.ending = 'られる'
    }
  }

  private checkImp(): void {
    // Checks for imperative form. As it is impossible to get the stem of a group 1 verb imperative verb without the
    // use of a lookup table, this simply sets this.ending to "" do nothing is done to it later on in the code.
    // If the word ends in an "e" character, it sets wordG to "one", "imp".
    if (this.includes(this.eList, -1)) {
      this.wordG = ['one', 'imp']
      this.ending = ''
    }
    // Also checks for imperative form, but for group 2.
    // If the last character is "ろ", wordG is assigned as "two", "imp" and ending is assigned as "ろ".
    else if (this.wordPos(-1) === 'ろ') {
      this.wordG = ['two', 'imp']
      this.ending = 'ろ'
    }
  }

  private checkVol(): void {
    // Checks for volitional form
    // If the word ends with "よう", it is automatically considered a group two volitional verb. wordG is updated to
    // reflect this.
    if (this.includes(this.oList, -2)) {
      for (let i of this.oList) {
        if (this.word.endsWith('よう')) {
          this.wordG = ['two', 'vol']
          this.ending = 'よう'
        }
        // After looping through list of "o" characters, if the ending of the word equals i + "う", wordG is set
        // as "one", "vol" and ending assigned as i + "う".
        else if (
          this.word.endsWith(i + 'う') &&
          !(this.wordG[0] === 'two' && this.wordG[1] === 'vol')
        ) {
          this.wordG = ['one', 'vol']
          this.ending = i + 'う'
        }
      }
    }
  }

  private checkPass(): void {
    // Checks for group 1 passive form
    // This function checks if the word ends with an "i" character + "れる", and sets wordG to "one", "pass" and
    // ending to "れる". This does not have an extra if statement for group 2 verbs, because they would be conjugated
    // correctly anyway.
    for (let i of this.wordList) {
      if (this.word.endsWith(i + 'れる')) {
        this.wordG = ['one', 'pass']
        this.ending = 'れる'
      }
    }
  }

  private checkTe(): void {
    // Checks for te form.
    // This looks at the end of the word, if it's ending is in the "tte" list wordG will be set as "one". "tte" and
    // ending will be set as i. If the word just ends in "て" or "た" it is considered a group two verb.
    if (this.wordG.length === 1 && this.wordG[0] === '') {
      for (let i of this.tte) {
        if (this.word.endsWith(i)) {
          this.wordG = ['one', 'tte']
          this.ending = i
        } else {
          if (this.word.endsWith('て')) {
            this.ending = 'て'
          } else if (this.word.endsWith('た')) {
            this.ending = 'た'
          }
        }
      }
    }
  }

  /**
   * This is where the code mainly starts. It calls the checkAdj method, if it is successful in detecting an adjective
   * it will set the word type variable to "adj". If it does not detect an adjective, it wordType to "vb" and assumes
   * the word is a verb. It will then do the checks in checkVerb()
   */
  private step1(): void {
    if (/[\u3040-\u309F]/.test(this.word)) {
      if (this.checkAdj() === true) {
        this.wordType = 'adj'
      } else {
        this.wordType = 'vb'
        this.checkVb()
      }
    } else {
      this.wordG = ['']
    }
  }

  /**
   * Conjugates the polite, negative, past and past negative forms
   */
  private step2(): void {
    // Conjugates group one "normal" verbs.
    // First it checks wordG for the type of verb.
    if (this.wordG[1] === 'normal') {
      if (
        (this.wordG[0] === 'two' && !this.includes(this.uList, -1)) ||
        this.wordPos(-1) !== 'る'
      ) {
        // Conjugates plain neg forms. It took at what list the last character is in (Either "a", "e", "i", "o" or ""),
        // finds the index of that character in that character's list, and replaces it with an appropriate
        // character of the same index in the list it needs to conjugate to. This method is used repeatedly
        // throughout the algorithm.
        if (
          this.includes(
            this.wordList,
            this.original.length - (this.ending.length + 1)
          )
        ) {
          // In the case of a negative verb (which always end with an "a" character before the suffix), this
          // removes the "a" character and replaces it with an "" character in order to conjugate it to plain form.
          this.word =
            this.word.slice(0, -1) +
            this.uList[this.wordList.indexOf(this.wordPos(-1))]
        }
        // Conjugates polite forms.
        // This does the same as the previous if statement, but for "i" characters.
        else if (
          this.iList.includes(
            this.word[this.original.length - (this.ending.length + 1)]
          )
        ) {
          this.word =
            this.word.slice(0, -1) +
            this.uList[this.iList.indexOf(this.wordPos(-1))]
        }
      }
      // This conjugates in the case of a group two verb, which just need to have "る" added to the end.
      if (this.wordG[0] === 'two') {
        this.word += 'る'
      }
    }
    if (this.wordG[0] === 'shimasu') {
      this.word += 'る'
    }
  }

  private step2a(): void {
    // This conjugates adjectives, if wordG == "i", "adjective" it simply adds "い" to the end.
    if (this.wordG[1] === 'adjective') {
      if (this.wordG[0] === 'i') {
        this.word += 'い'
      }
      if (this.wordG[0] === 'na') {
        // self.word -= len(self.ending)
        this.word = this.word.slice(-this.ending.length)
      }
    }
  }

  /**
   * Conjugates te form / ta form
   */
  private step3(): void {
    if (this.wordG[1] === 'tte') {
      if (this.wordG[0] === 'one') {
        this.word = this.original
      } else if (this.wordG[0] === 'two') {
        this.word += 'る'
      }
    }
  }

  /**
   * Conjugates potential form
   */
  private step4(): void {
    if (this.wordG[1] === 'pot') {
      if (this.wordG[0] === 'one') {
        //pass
        //this.word = this.word[:-1] + this.uList[this.wordList.index(this.position(-1))] += "る"
      }
    }
  }

  /**
   * Conjugates imperative form
   */
  private step5(): void {
    // This only works for group two imperative verbs because it isn't possible to recognize group one verbs without
    // mistaking for a different kind of verb.
    // This only adds "る" to the end of the word.
    if (this.wordG[1] === 'imp' && this.wordG[0] === 'two') {
      this.word += 'る'
    }
  }

  /**
   * Conjugates volitional form
   */
  private step6(): void {
    // If wordG == "vol" and "one", it gets the last character's index in it's appropriate list and replaces it with
    // a character in "" list that has the same index.
    if (this.wordG[1] === 'vol') {
      if (this.wordG[0] === 'one') {
        this.word += this.uList[this.oList.indexOf(this.ending[0])]
      }
      // If the word is group two, it adds "る" to the end.
      else if (this.wordG[0] === 'two') {
        this.word += 'る'
      }
    }
  }

  /**
   * Conjugates passive form
   */
  private step7(): void {
    // If wordG == "one" and "pass", it gets the last character's index in it's appropriate list and replaces it with
    // a character in "" list with the same index.
    if (this.wordG[1] === 'pass') {
      if (this.wordG[0] === 'one') {
        this.word =
          this.word.slice(0, -1) +
          this.uList[this.wordList.indexOf(this.wordPos(-1))]
      }
    }
    // Not how step7 doesn't process group 2 verbs, that is because it is also impossible to tell group two passive
    // verbs from other kinds of verbs.
  }

  /**
   * Conjugates causative
   */
  private step8(): void {
    // This functions the same as most of the other steps, using the index of a character in a list to change it with
    // a character with the same index in a different list.
    if (this.wordG[1] === 'cause') {
      if (this.wordG[0] === 'one') {
        this.word =
          this.word.slice(0, -1) +
          this.uList[this.wordList.indexOf(this.wordPos(-1))]
      }
      // "る" is added to the end here as well.
      else if (this.wordG[0] === 'two') {
        this.word += 'る'
      }
    }
  }

  private includes(list: string[], position: number): boolean {
    return list.includes(this.wordPos(position))
  }

  private wordPos(position: number): string {
    if (position > -1) {
      return this.word[position]
    } else if (position === -1) {
      return this.word.slice(-1)
    }
    return this.word.slice(position, position + 1)
  }
}

export default function stem(w: string) {
  const stem = new JPStemmer()
  return stem.stemmer(w)
}
