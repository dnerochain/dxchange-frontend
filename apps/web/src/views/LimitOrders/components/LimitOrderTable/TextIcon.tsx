import { Flex, Text } from '@dneroswap/uikit'
import { ReactElement } from 'react'

interface TextIconProps {
  text: string
  bold?: boolean
  icon: ReactElement
}

const TextIcon: React.FC<React.PropsWithChildren<TextIconProps>> = ({ icon, text, bold = false }) => {
  return (
    <Flex alignItems="center">
      <Text color="text" mr="8px" bold={bold} textTransform="uppercase">
        {text}
      </Text>
      {icon}
    </Flex>
  )
}

export default TextIcon
