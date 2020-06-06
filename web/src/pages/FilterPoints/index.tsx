import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiSliders} from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { icon as LeafIcon } from 'leaflet'


import api from '../../services/api'
import axios from 'axios'
import './styles.css'
import logo from '../../assets/logo.svg'

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

interface points {
    name: string,
    id: number,
    image_url: string,
    latitude: number,
    longitude: number
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [points, setPoints] = useState<points[]>([])
    const [ufs, setSetUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0, 0])
    const [showAlert, setShowAlert] = useState<boolean>(false)

    const [selectedUf, setSelectedUf] = useState<string>('')
    const [selectedCity, setSelectedCity] = useState<string>('')
   
    const [selectedItems, setSelectedItems] = useState<number[]>([])

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

        const uf = selectedUf
        const city = selectedCity
        const items = selectedItems

        await api.get(`points?city=${city}&uf=${uf}&items=${items}`)
        .then(response => {
            setPoints(response.data)
        })

    }

    return (
        <div id="page-filter-points">

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

            <div className="container-glob">
            <form onSubmit={handleSubmit}>
                <h1>Procurar pontos de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Filtros</h2>
                    </legend>

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

                <button type="submit"> <FiSliders size={15}/> Filtrar</button>  
             
            </form>

            {points.length !== 0 ? (
            <div className="results">
                    <legend>
                        <h2>Resultados</h2>
                        <span>Listagem com base nos filtros</span>
                    </legend>

                    <div className="items-result-list">
                        {
                            points.map((point) =>(
                                    <li key={point.id}>
                                        {point.name}
                                        <img 
                                            src={point.image_url}
                                            alt={`Ponto de coleta ${point.name}`}
                                        />
                                    </li>                                
                            ))
                        }


                    </div>
            </div>
            ):(
               <span style={{ textAlign: 'center'}}>Sem resultados</span>
            )}

            </div>
        </div>
    )
}

export default CreatePoint