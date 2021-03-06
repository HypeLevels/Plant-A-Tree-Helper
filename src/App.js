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
  TableCaption,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { abi } from "./abi"
import { ethers } from "ethers"

const injected = new InjectedConnector()

function App() {
  const [getMyTrees, setGetMyTrees] = useState(0)
  const [replantDate, setReplantDate] = useState("")
  const [totalAvax, setTotalAvax] = useState("0 AVAX")
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [dayList] = useState([{ day: 1, value: 0, diff: 0 }, { day: 2, value: 0, diff: 0 }, { day: 3, value: 0, diff: 0 }, { day: 4, value: 0, diff: 0 }, { day: 5, value: 0, diff: 0 }, { day: 6, value: 0, diff: 0 }, { day: 7, value: 0, diff: 0 }])
  const [error, setError] = useState("")
  const [currentTax, setCurrentTax] = useState("0%")
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
          setTotalAvax(ethers.utils.formatEther(tx2) + " AVAX")
          const tx3 = await contract.getMyReferralsUsedCount()
          setTotalReferrals(tx3.toNumber())
          const tx4 = await contract.diffTimeSinceLastRePlantTree()
          const diff = 86400000 - (tx4.toNumber() * 1000)
          setReplantDate(new Date(Date.now() + diff).toLocaleString("en-GB"))
          const tx5 = await contract.getCurrentDayExtraTax(1)
          setCurrentTax(tx5.toNumber() + "%")
          for (let i = 0; i < dayList.length; i++) {
            if (i === 0) {
              dayList[i].value = Math.round(tx1.toNumber() + (tx1.toNumber() * 0.08))
              dayList[i].diff = dayList[i].value - tx1.toNumber()
            } else {
              dayList[i].value = Math.round((dayList[i - 1].value + (dayList[i - 1].value * 0.08)))
              dayList[i].diff = dayList[i].value - dayList[i-1].value 
            }
          }
        } catch (e) {
          console.log(e)
          setError("Something Wrong Happened")
          setTimeout(() => { setError("") }, 5000)
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
              Plant A Tree Helper
            </Heading>
            {active ? chainId !== 43114 ? <Text>Please Change your network to Avalanche Network.</Text> :
              <>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        {dayList.map((element) => {
                          return <Th textAlign="center" key={element.day}>Day {element.day}</Th>
                        })}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        {dayList.map((element) => {
                          return <Td key={element.day}>{element.value}</Td>
                        })}
                      </Tr>
                      <Tr>
                        {dayList.map((element) => {
                          return <Td key={element.day}>+{element.diff}</Td>
                        })}
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Total Invested</Th>
                        <Th>Total Trees</Th>
                        <Th>Referrals</Th>
                        <Th>Current Tax</Th>
                        <Th textAlign="center">Next Replant</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td textAlign="center">{totalAvax}</Td>
                        <Td textAlign="center">{getMyTrees}</Td>
                        <Td textAlign="center">{totalReferrals}</Td>
                        <Td textAlign="center">{currentTax}</Td>
                        <Td>{replantDate}</Td>
                      </Tr>
                    </Tbody>
                    <TableCaption>Estimated amount of trees based on 8% daily return.<br />Next Replant date might have some seconds of inacuracy due to how the blockchain updates.</TableCaption>
                  </Table>
                </TableContainer>
                <Text>{error}</Text>
              </>
              : window.ethereum ? <><Text>Please connect your MetaMask wallet.</Text><Button onClick={() => activate(injected, console.log(error))}>Connect</Button></> : <><Text>Please install MetaMask.</Text><Button onClick={() => window.open("https://metamask.io/")}>MetaMask Website</Button></>}
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;