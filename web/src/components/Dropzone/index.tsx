import React, { useCallback, useState } from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload, FiCheckCircle } from 'react-icons/fi'

import './styles.css'

interface Props {
    onFileUploaded: (params: File) => void
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {

    const [selectedFileUrl, setSelectedFileUrl] = useState('')
    const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    // console.log(acceptedFiles)
    const file = acceptedFiles[0]

    setSelectedFileUrl( URL.createObjectURL(file) )
    onFileUploaded(file)
    
  }, [onFileUploaded])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({ 
      onDrop,
      accept: 'image/*',
    })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept='image/*' />
        {
        selectedFileUrl ?
            <img src={selectedFileUrl} alt="point thumb"/>
        :
            isDragActive ?
              <p> <FiCheckCircle/> Solte a imagem aqui ...</p> :
              <p> <FiUpload/> Imagem do estabelecimento</p>
        }

    </div>
  )
}

export default Dropzone