import { celebrate, Joi, Segments } from 'celebrate'

class PointsValitor {
    createPoint(){
        return celebrate({
            [Segments.BODY]: Joi.object().keys({
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                whatsapp: Joi.number().required(),
                latitude: Joi.number().required(),
                longitude: Joi.number().required(),
                city: Joi.string().required(),
                uf: Joi.string().required().max(2),
                items: Joi.string().required(),
            })
        },{
            abortEarly: false
        })
    }
}

export default PointsValitor