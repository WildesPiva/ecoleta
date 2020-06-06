import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import CreatePoint from './pages/CreatePoint'
import FiltertPoints from './pages/FilterPoints'

const Routes = () => {
    return(
        <BrowserRouter>
            <Route component={Home} exact path="/"/>
            <Route component={CreatePoint} path="/create-point"/>
            <Route component={FiltertPoints} path="/filter-points"/>
        </BrowserRouter>
    )
}

export default Routes