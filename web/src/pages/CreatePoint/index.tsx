import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUfResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const history = useHistory();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ','
  });

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number,number]>();

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setselectedFile] = useState<File>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;
      setInitialPosition([latitude,longitude]);
    });
  });

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then( response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    });
  });

  useEffect(() => {
    if (selectedUf === '0') {
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`).then( response => {
      const cityNames = response.data.map(city => city.nome)
      setCities(cityNames)
   });
   
  }, [selectedUf]);

  function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
    setSelectedCity('');

  }

  function handleSelectCity (event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick (event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat,event.latlng.lng]);
  }

  function handleSelectItem (id: number) {
    const alreadySelected = selectedItems.includes(id);

    if (alreadySelected) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }

  }

  async function handleSubmit (event: FormEvent) {
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const [latitude,longitude] = selectedPosition;
    const uf = selectedUf;
    const city = selectedCity;
    const items = selectedItems;

    const data = new FormData();

    
    data.append('name',name);
    data.append('email',email);
    data.append('whatsapp',whatsapp);
    data.append('latitude',String(latitude));
    data.append('longitude',String(longitude));
    data.append('uf',uf);
    data.append('city',city);
    data.append('items',items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }    

    await api.post('points', data);

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta logo"/>
        <Link to="/">
          <FiArrowLeft/> Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> Ponto de Coleta</h1>
        <Dropzone onFileUploaded={setselectedFile}/>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input 
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>

              <div className="field">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input 
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer  
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectUf} value={selectedUf}>
                <option value="0"> Selectione um Estado</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected': ''}
              >
              <img src={item.image_url} alt={item.title}/>
              <span>{item.title}</span>
              </li>
            ))}
          </ul>

        </fieldset>
        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint