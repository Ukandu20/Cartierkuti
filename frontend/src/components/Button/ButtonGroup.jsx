import { ButtonGroup as ChakraButtonGroup } from '@chakra-ui/react'
import styles from './ButtonGroup.module.css'

const ButtonGroup = ({ children, ...props }) => (
  <ChakraButtonGroup className={styles.buttonGroup} {...props}>
    {children}
  </ChakraButtonGroup>
)

export default ButtonGroup
