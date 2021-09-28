import { Model,Op } from 'sequelize'
import { Actions } from '..'

export const sequelizeCrud = <I extends string | number, R extends Model>(
  model: R | { new (): R }
): Omit<Actions<I, R>, 'search'> => {
  const _model: any = model // TODO: how to correctly type this???
  return {
    create: async body => _model.create(body),
    update: async (id, body) => {
      const record = await _model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      return record.update(body)
    },
    getOne: async id => _model.findByPk(id),
    getList: async ({ filter, limit, offset, order }) => {
      for (const [key, value] of Object.entries(filter)) {
        console.log(`${value}`);
        if(typeof value == "boolean" && value == true ) filter[key] = {[Op.or] : {[Op.is] : value}}
        if(typeof value == "boolean" && value == false ) filter[key] = {[Op.or] : [{[Op.is] : value},{[Op.is] : null}]}
      } 
      return _model.findAndCountAll({
        limit,
        offset,
        order,
        where: filter,
        raw: true,
      })
    },
    destroy: async id => {
      const record = await _model.findByPk(id)
      if (!record) {
        throw new Error('Record not found')
      }
      await record.destroy()
      return { id }
    },
  }
}
