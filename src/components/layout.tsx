import styled from 'styled-components/macro'

interface RowProps {
  gap?: string
  wrap?: string
  columnGap?: string
  rowGap?: string

  justifyEnd?: boolean
  justifyCenter?: boolean
}

export const Row = styled.div<RowProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: ${({ wrap }) => wrap};
  gap: ${({ gap }) => gap};
  column-gap: ${({ columnGap }) => columnGap};
  row-gap: ${({ rowGap }) => rowGap};

  ${({ justifyEnd }) => justifyEnd && 'justify-content: flex-end;'}
  ${({ justifyCenter }) => justifyCenter && 'justify-content: center;'}
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const Column = styled.div<{ gap?: string; stretch?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ stretch }) => (stretch ? 'stretch' : 'flex-start')};
  gap: ${({ gap }) => gap};
`

export const ColumnCenter = styled(Column)`
  align-items: center;
`
