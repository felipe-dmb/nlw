import React, {useEffect, useState} from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import {View, ImageBackground,Image, StyleSheet, Text} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface IBGEUfResponse {
  sigla:string;
}

interface IBGECityResponse {
  nome: string;
}

const Home = () => {
  const navigation = useNavigation();
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUf, setSelectedUf] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();

  useEffect(() => {
    axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then( response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    });
  },[]);

  useEffect(() => {
    if (selectedUf === '0') {
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`).then( response => {
      const cityNames = response.data.map(city => city.nome)
      setCities(cityNames)
   });
  }, [selectedUf]);

  function handleNavigationToPoints () {
    navigation.navigate('Points', {
      city: selectedCity,
      uf: selectedUf,
      items: '',
    });
  }

  function handleSelectUf (uf:string) {
    setSelectedUf(uf);
    setSelectedCity('');
  }

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu Marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
      </View>

      
      <RNPickerSelect 
        style={pickerSelectStyles}
        placeholder={{label:"Selecione um Estado",color:'#000',value:null}}
        value={selectedUf}
        onValueChange={value => {handleSelectUf(value)}}
        items={ufs.map(uf => (
          {label:uf,value:uf,key:uf}
        ))}
        />
    
    
      <RNPickerSelect
        style={pickerSelectStyles}
        placeholder={{label:"Selecione uma Cidade",color:'#000',value:null}}
        value={selectedCity}
        onValueChange={value => setSelectedCity(value)}
        items={cities.map(city => (
          {label:city,value:city,key:city}
        ))}
      />
      

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigationToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#fff" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
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
    maxWidth: 260,
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

  select: {},

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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default Home;