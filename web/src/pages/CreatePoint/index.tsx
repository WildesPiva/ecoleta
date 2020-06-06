import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer,Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import * as yup from 'yup'

import api from '../../services/api'
import axios from 'axios'
import './styles.css'
import logo from '../../assets/logo.svg'
import Dropzone from '../../components/Dropzone'

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface ibgeUfResponse {
    sigla: string
}

interface ibgeCityResponse {
    nome: string
}

const schema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().email().required(),
    whatsapp: yup.number().required(),
    uf: yup.string().required(),
    city: yup.string().required(),
    latitude: yup.number().required().test(
        "required",
        "Selecione um local no mapa",
        value => value && value !== 0
    ),
    longitude: yup.number().required().test(
        "required",
        "Selecione um local no mapa",
        value => value && value !== 0
    ),
    items: yup
    .mixed()
    .required().test(
        "required",
        "Ao menos um item de coleta precisa ser selecionado",
        (value: Array<number>) => value && value.length !== 0
    ),
    image: yup
    .mixed()
    .required()
    .test(
        "fileSize",
        "Arquivo muito grande (max 5MB)",
        value => value && value.size <= 5000000
    )
    .test(
        "fileFormat",
        "Formato invalido, precisa ser uma imagem (jpg, jpeg, png)",
        value => value && [ "image/jpg", "image/jpeg", "image/png"].includes(value.type)
    )
  });

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [ufs, setSetUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0, 0])
    const [showAlert, setShowAlert] = useState<boolean>(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })
    const [selectedUf, setSelectedUf] = useState<string>('')
    const [selectedCity, setSelectedCity] = useState<string>('')
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0, 0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords
            setInitialPosition([ latitude, longitude ])
        })
    },[])

    useEffect(() => {
        api.get('items').then(response => setItems(response.data))
    }, [])

    useEffect(() => {
        axios.get<ibgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response =>{ 
            setSetUfs(response.data.map(uf => uf.sigla))
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') return
        
        axios.get<ibgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response =>{ 
            setCities(response.data.map(city => city.nome))
        })
    }, [selectedUf])


    const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUf(event.target.value)
    }

    const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(event.target.value)
    }

    const handleClickMap = (event: LeafletMouseEvent) => {
        setSelectedPosition([
            event.latlng.lat, 
            event.latlng.lng
        ])
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if( alreadySelected >= 0 ) {
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems,id])
        }     
        
    }

    const handleClickMessage = () => {
        history.push('/')
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        // console.log(selectedFile)
        // return
        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = new FormData()
        
        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude)) 
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))
        if(selectedFile)
            data.append('image', selectedFile)


        schema
        .validate({ name, email, whatsapp, uf, city, latitude, longitude, items, image: selectedFile })
        .then(
            async function (valid) {
            // console.log('validou! ',valid)

            await api.post('points', data)

            setShowAlert(true)

            setTimeout(() => {
                history.push('/')
            }, 2000)

        }).catch(( { type, path } ) => {
            console.log(type, path)
            // console.log(error)
        })  

        //  Format Object 
        // const data = {
        //     name,
        //     email,
        //     whatsapp,
        //     uf,
        //     city,
        //     latitude, 
        //     longitude,
        //     items
        // }


    }

    return (
        <div id="page-create-point">

            <div className={showAlert ? "success-message" : "disabled-message"} onClick={handleClickMessage}>
                <div className="content">
                    <FiCheckCircle/>
                    <h1>Cadastro concluído!</h1>
                </div>
            </div>

            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            onChange={handleInputChange}
                            type="text" 
                            name="name" 
                            id="name"
                        />
                    </div>
                    <div className="field-group">

                    <div className="field">
                        <label htmlFor="email">E-Mail</label>
                        <input 
                            onChange={handleInputChange}
                            type="email" 
                            name="email" 
                            id="email"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input 
                            onChange={handleInputChange}
                            type="text" 
                            name="whatsapp" 
                            id="whatsapp"
                        />
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map 
                        onClick={handleClickMap}
                        center={initialPosition} 
                        zoom={15}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                            position={selectedPosition}
                        />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="UF">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}>

                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => 
                                    <option 
                                    key={uf} 
                                    value={uf}>
                                        {uf}
                                    </option>
                                )}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select 
                                name="cidade" 
                                id="cidade" 
                                value={selectedCity} 
                                onChange={handleSelectCity} >

                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => 
                                    <option 
                                    key={city} 
                                    value={city}>
                                        {city}
                                    </option>
                                )}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map((item) => (
                        <li 

                        className={selectedItems.includes(item.id) ? "selected":''} 
                        key={item.id} 
                        onClick={()=>handleSelectItem(item.id)} >
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                        ))}

                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint