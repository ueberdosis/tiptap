/* eslint-disable no-unused-expressions, @typescript-eslint/no-unused-expressions */

describe('Mathematics extension WebKit compatibility', () => {
  describe('InlineMath input rules', () => {
    it('should match single dollar math expressions without lookbehind', () => {
      // We need to test the actual regex patterns used in the InputRules
      // Since InputRule patterns are internal, we test the core regex logic
      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/

      // Test single dollar patterns
      expect('$x^2$').to.match(singleDollarRegex)
      expect('text $x^2$').to.match(singleDollarRegex)
      expect('$a + b = c$').to.match(singleDollarRegex)

      // Test double dollar patterns
      expect('$$x^2$$').to.match(doubleDollarRegex)
      expect('text $$x^2$$').to.match(doubleDollarRegex)
      expect('$$a + b = c$$').to.match(doubleDollarRegex)
    })

    it('should not match incomplete expressions', () => {
      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/

      expect('$incomplete').to.not.match(singleDollarRegex)
      expect('incomplete$').to.not.match(singleDollarRegex)
      expect('$$incomplete').to.not.match(doubleDollarRegex)
      expect('incomplete$$').to.not.match(doubleDollarRegex)
    })

    it('should handle edge cases correctly', () => {
      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/

      // Should not match when preceded by $
      expect('$$x$').to.not.match(singleDollarRegex)
      expect('$$$x$$').to.not.match(doubleDollarRegex)

      // Should not match when followed by $
      expect('$x$$').to.not.match(singleDollarRegex)
      expect('$$x$$$').to.not.match(doubleDollarRegex)
    })

    it('should extract correct capture groups', () => {
      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/

      const singleMatch = 'text $x^2$'.match(singleDollarRegex)
      expect(singleMatch).to.not.be.null
      expect(singleMatch![1]).to.equal(' ') // Character before $
      expect(singleMatch![2]).to.equal('x^2') // Math content

      const doubleMatch = 'text $$x^2$$'.match(doubleDollarRegex)
      expect(doubleMatch).to.not.be.null
      expect(doubleMatch![1]).to.equal(' ') // Character before $$
      expect(doubleMatch![2]).to.equal('x^2') // Math content
    })
  })

  describe('BlockMath input rules', () => {
    it('should match double and triple dollar math expressions without lookbehind', () => {
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/
      const tripleDollarRegex = /^\$\$\$([^$]+)\$\$\$$/

      // Test double dollar patterns for block math
      expect('$$x^2$$').to.match(doubleDollarRegex)
      expect('text $$x^2$$').to.match(doubleDollarRegex)

      // Test triple dollar patterns for block math
      expect('$$$x^2$$$').to.match(tripleDollarRegex)
      expect('$$$\\frac{1}{2}$$$').to.match(tripleDollarRegex)
    })

    it('should not match single dollar expressions', () => {
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/
      const tripleDollarRegex = /^\$\$\$([^$]+)\$\$\$$/

      expect('$x^2$').to.not.match(doubleDollarRegex)
      expect('$x^2$').to.not.match(tripleDollarRegex)
    })

    it('should handle edge cases correctly', () => {
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/
      const tripleDollarRegex = /^\$\$\$([^$]+)\$\$\$$/

      // Should not match when surrounded by additional $
      expect('$$$x$$').to.not.match(doubleDollarRegex)
      expect('$$x$$$').to.not.match(doubleDollarRegex)
      expect('$$$$x$$$$$').to.not.match(tripleDollarRegex)
    })
  })

  describe('WebKit compatibility', () => {
    it('should not use lookbehind assertions', () => {
      // Test that regex patterns don't contain lookbehind syntax
      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/
      const tripleDollarRegex = /^\$\$\$([^$]+)\$\$\$$/

      const singlePattern = singleDollarRegex.toString()
      const doublePattern = doubleDollarRegex.toString()
      const triplePattern = tripleDollarRegex.toString()

      expect(singlePattern).to.not.include('(?<!')
      expect(singlePattern).to.not.include('(?<=')
      expect(doublePattern).to.not.include('(?<!')
      expect(doublePattern).to.not.include('(?<=')
      expect(triplePattern).to.not.include('(?<!')
      expect(triplePattern).to.not.include('(?<=')
    })

    it('should work in simulated older WebKit environment', () => {
      // Simulate what would happen in older WebKit by manually testing the regex
      const testInOlderWebKit = (regex: RegExp, testString: string) => {
        try {
          return regex.test(testString)
        } catch {
          // In older WebKit, lookbehind would throw "Invalid regular expression"
          return false
        }
      }

      const singleDollarRegex = /(^|[^$])\$([^$\n]+)\$(?!\$)$/
      const doubleDollarRegex = /(^|[^$])\$\$([^$\n]+)\$\$(?!\$)$/
      const tripleDollarRegex = /^\$\$\$([^$]+)\$\$\$$/

      // These should work without throwing errors
      expect(testInOlderWebKit(singleDollarRegex, '$x^2$')).to.be.true
      expect(testInOlderWebKit(doubleDollarRegex, '$$x^2$$')).to.be.true
      expect(testInOlderWebKit(tripleDollarRegex, '$$$x^2$$$')).to.be.true
      expect(testInOlderWebKit(singleDollarRegex, 'text $x^2$')).to.be.true
      expect(testInOlderWebKit(doubleDollarRegex, 'text $$x^2$$')).to.be.true
    })
  })
})
