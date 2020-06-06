import React from 'react'
import { FiPlus, FiMenu } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import logo from '../../assets/logo.svg'
import './styles.css'

const Home = ()=>{
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                </header>

                <main>
                    <h1>Seu marketplace de coleta de Resíduos.</h1>
                    <p>Ajudamos pessoas a encontrarem pontos de coletas de forma eficiente.</p>
                    <Link to="/create-point">
                        <span><FiPlus/></span>
                        <strong>Cadastre um ponto de coleta</strong>
                    </Link>
                    <Link to="/filter-points">
                        <span><FiMenu/></span>
                        <strong>Ver pontos de coleta</strong>
                    </Link>
                </main>
            </div>
        </div>
    )
}

export default Home