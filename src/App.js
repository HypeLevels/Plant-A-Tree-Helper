import React, { useEffect, useState } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Heading,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { abi } from "./abi"
import { ethers } from "ethers"

const injected = new InjectedConnector()

function App() {
  const [getMyTrees, setGetMyTrees] = useState(0)
  const [totalAvax, setTotalAvax] = useState(0)
  const [dayList] = useState([{ day: 1, value: 0 }, { day: 2, value: 0 }, { day: 3, value: 0 }, { day: 4, value: 0 }, { day: 5, value: 0 }, { day: 6, value: 0 }, { day: 7, value: 0 }])
  const [error, setError] = useState("")
  const [treeIncrease, setTreeIncrease] = useState(0)
  const { activate, active, library: provider, chainId } = useWeb3React()

  useEffect(() => {
    async function getData() {
      if (active) {
        const signer = provider.getSigner()
        const contractAddress = "0xFd97C61962FF2aE3D08491Db4805E7E46F38C502"
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
          const tx1 = await contract.getMyMiners()
          setGetMyTrees(tx1.toNumber())
          const tx2 = await contract.totalPlantedBalance()
          setTotalAvax(ethers.utils.formatEther(tx2))
          for (let i = 0; i < dayList.length; i++) {
            if (i === 0) {
              dayList[i].value = Math.round(tx1.toNumber() + (tx1.toNumber() * 0.08))
            } else {
              dayList[i].value = Math.round((dayList[i - 1].value + (dayList[i - 1].value * 0.08)))
            }
          }
          setTreeIncrease(Math.round(dayList[6].value / tx1.toNumber() * 100))
        } catch (e) {
          console.log(e)
          setError("Something Wrong Happened")
          setTimeout(() => {
            setError("")
          }, 5000)
        }
      }
    }
    getData()
  }, [chainId, active, dayList, provider])


  return (

    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Heading>
              Plant A Tree - Profit Calculator
            </Heading>
            {active ? chainId !== 43114 ? <Text>Please Change your network to Avalanche Network.</Text> :
              <>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        {dayList.map((element) => {
                          return <Th key={element.day}>Day {element.day}</Th>
                        })
                        }
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        {dayList.map((element) => {
                          return <Td key={element.day}>{element.value}</Td>
                        })
                        }
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Total Avax Invested</Th>
                        <Th>Total Trees</Th>
                        <Th>Total Tree Increase (in %)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{totalAvax}</Td>
                        <Td>{getMyTrees}</Td>
                        <Td>{treeIncrease}</Td>
                      </Tr>
                    </Tbody>
                    <TableCaption>Estimated tree values based on 8% daily return.</TableCaption>
                  </Table>
                </TableContainer>
                <Text>{error}</Text>
              </>
              : <><Text>Please connect your MetaMask wallet!</Text><Button onClick={() => activate(injected, console.log(error))}>Connect</Button></>}
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;