import Knex from 'knex'

export async function up(knex: Knex){
    //CRIAÇÃO DA TABELA
    return knex.schema.createTable('items', table => {
        table.increments('id').primary()
        table.string('image').notNullable()
        table.string('title').notNullable()
    })
}

export async function down(knex: Knex) {
    //DESFAZER CRIAÇÃO DA TABELA
    return knex.schema.dropTable('items')
}
