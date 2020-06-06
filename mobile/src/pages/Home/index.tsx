import React, { useState, useEffect } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, ImageBackground, Image, StyleSheet, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import PickerSelect,{ PickerStyle } from 'react-native-picker-select';
import axios from 'axios'

interface ibgeUfResponse {
  sigla: string
}

interface ibgeCityResponse {
  nome: string
}

const Home = () => {
    const [ufs, setUfs]   = useState<string[]>([''])
    const [cities, setCities]   = useState<string[]>([''])
    const [uf, setUf]   = useState('')
    const [city, setCity]   = useState('')
    const navigation = useNavigation()


    useEffect(() => {
      axios.get<ibgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response =>{ 
        setUfs(response.data.map(uf => uf.sigla))
      })
  }, [])

  useEffect(() => {
    if (uf === '0') return
    
    axios.get<ibgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
    .then(response =>{ 
        setCities(response.data.map(city => city.nome))
    })
}, [uf])

    function handleNavigatioToPoints() {
      navigation.navigate('Points', { 
        uf,
        city
      })
    }

    function handleSelectUf(uf: string) {
      setUf(uf)
    }

    function handleSelectCity(city: string) {
      setCity(city)
    }
    return (
        <ImageBackground 
          imageStyle={{width: 274, height: 368}}
          source={require('../../assets/home-background.png')} 
          style={styles.container}>

            <View style={styles.main}>
              <Image source={require('../../assets/logo.png')}/>
              <Text style={styles.title}> Seu marketplace de coleta de residuios</Text>
              <Text style={styles.description}> Ajudamos pessoas a econtrarem pontos de coleta de forma eficiente </Text>
            </View>

            <View style={styles.footer}>
              <PickerSelect
                style={{
                  viewContainer: {
                    backgroundColor: '#ffffff',
                    padding: 10,
                    borderRadius: 10,
                    marginVertical: 10
                  },
                  placeholder:{
                    fontSize: 16,
                  },
                }}
                onValueChange={(value) => handleSelectUf(value)}
                placeholder={ {label: 'Selecione uma UF', value: ''} }
                items={ufs.map(uf => ({ label: uf, value: uf}))}
              />  

              <PickerSelect
                style={{
                  viewContainer: {
                    backgroundColor: '#ffffff',
                    padding: 10,
                    borderRadius: 10,
                    marginVertical: 10
                  },
                  placeholder:{
                    fontSize: 16,
                  }
                }}
                onValueChange={(value) => handleSelectCity(value)}
                placeholder={ {label: 'Selecione uma cidade', value: ''} }
                items={cities.map(city => ({ label: city, value: city}))}
              />                           

              <RectButton style={styles.button} onPress={handleNavigatioToPoints} >
                <View style={styles.buttonIcon}>
                  <Icon name="arrow-right" color="white" size={24} />
                </View>
                <Text style={styles.buttonText}> Entrar </Text>
              </RectButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 264,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home