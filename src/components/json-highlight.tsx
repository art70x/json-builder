import { useMemo } from 'react'

type TokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'whitespace'

interface Token {
  type: TokenType
  value: string
}

function tokenize(json: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < json.length) {
    const char = json[index]

    // Whitespace
    if (/\s/.test(char)) {
      let ws = ''
      while (index < json.length && /\s/.test(json[index]!)) {
        ws += json[index]
        index++
      }
      tokens.push({ type: 'whitespace', value: ws })
      continue
    }

    // String
    if (char === '"') {
      let string_ = '"'
      index++

      while (index < json.length && json[index] !== '"') {
        if (json[index] === '\\') {
          string_ += json[index]
          index++
        }

        string_ += json[index]
        index++
      }

      string_ += '"'
      index++

      let index_ = index
      while (index_ < json.length && /\s/.test(json[index_]!)) index_++

      const isKey = json[index_] === ':'

      tokens.push({
        type: isKey ? 'key' : 'string',
        value: string_,
      })

      continue
    }

    // Number
    if (/[-\d]/.test(char)) {
      let number_ = ''
      while (index < json.length && /[-\d.eE+]/.test(json[index]!)) {
        number_ += json[index]
        index++
      }

      tokens.push({ type: 'number', value: number_ })
      continue
    }

    // Boolean / null
    if (json.startsWith('true', index)) {
      tokens.push({ type: 'boolean', value: 'true' })
      index += 4
      continue
    }

    if (json.startsWith('false', index)) {
      tokens.push({ type: 'boolean', value: 'false' })
      index += 5
      continue
    }

    if (json.startsWith('null', index)) {
      tokens.push({ type: 'null', value: 'null' })
      index += 4
      continue
    }

    // Punctuation
    tokens.push({
      type: 'punctuation',
      value: json[index],
    })
    index++
  }

  return tokens
}

const colorMap: Record<TokenType, string> = {
  key: 'text-code-key',
  string: 'text-code-string',
  number: 'text-code-number',
  boolean: 'text-code-boolean',
  null: 'text-code-null',
  punctuation: 'text-code-punctuation',
  whitespace: '',
}

interface JsonHighlightProperties {
  json: string
  className?: string
}

export function JsonHighlight({ json, className }: JsonHighlightProperties) {
  const tokens = useMemo<Token[]>(() => {
    try {
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, 2)
      return tokenize(formatted)
    } catch {
      return [{ type: 'string', value: json }]
    }
  }, [json])

  const lines = useMemo<Token[][]>(() => {
    const result: Token[][] = [[]]

    for (const token of tokens) {
      const currentLine = result.at(-1)!

      if (token.type === 'whitespace' && token.value.includes('\n')) {
        const parts = token.value.split('\n')

        if (parts[0]) {
          currentLine.push({
            type: 'whitespace',
            value: parts[0],
          })
        }

        for (let index = 1; index < parts.length; index++) {
          result.push([])

          if (parts[index]) {
            result.at(-1)!.push({
              type: 'whitespace',
              value: parts[index],
            })
          }
        }
      } else {
        currentLine.push(token)
      }
    }

    return result
  }, [tokens])

  const lineCount = lines.length
  const gutterWidth = String(lineCount).length

  return (
    <pre className={className}>
      <code>
        {lines.map((lineTokens, lineIndex) => {
          const lineNumber = lineIndex + 1

          return (
            <span key={lineIndex} className="flex">
              <span
                className="flex-shrink-0 pr-3 text-right font-mono text-xs text-muted-foreground/25 select-none"
                style={{ minWidth: `${gutterWidth + 1.5}ch` }}
                aria-hidden="true"
              >
                {lineNumber}
              </span>

              <span
                className="mr-3 flex-shrink-0 border-l border-border/20 select-none"
                aria-hidden="true"
              />

              <span className="flex-1">
                {lineTokens.map((token, tokIndex) => {
                  const key = `${lineIndex}-${tokIndex}`

                  if (token.type === 'whitespace') {
                    return <span key={key}>{token.value}</span>
                  }

                  return (
                    <span key={key} className={colorMap[token.type]}>
                      {token.value}
                    </span>
                  )
                })}
              </span>
            </span>
          )
        })}
      </code>
    </pre>
  )
}
