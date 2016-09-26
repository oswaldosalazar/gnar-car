var knex = require('./config');

// Mountains Queries

function findMountains(){
  return knex('mountain');
}

function findMountainsById(id){
  return findMountains().where('id',id);
}

// Weather Icon Queries
function getWeatherIcon(id){
  return knex('icons').select('icon').where('id',id);
}

module.exports = {
  findMountains: findMountains,
  findMountainsById: findMountainsById,
  getWeatherIcon: getWeatherIcon
};