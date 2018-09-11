module.exports = {

  attributes: {

    user_id: {
      type: 'string',
      required: true,
      unique: false,
    },
    url: {
      type: 'string',
      required: true,
      unique: false,
      isURL: true
    },
    title: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: false
    },
    website:{
      type: 'string',
      required: false
    },
    category: {
      type: 'string',
      isIn: ['education', 'news', 'tech', 'finance', 'misc'],
      defaultsTo: 'misc'
    },
    favorite:{
      type: 'boolean',
      defaultsTo: false,
    },
    refresh:{
        type: 'number',
        required: false,
        defaultsTo: 600,
        min: 60,
        max: 3600,
    },
    lastview:{
      type: 'string',
      required: false,
      defaultsTo: "0",
    },
    lastcheck:{
      type: 'string',
      required: false,
      defaultsTo: "0"
    },
    error:{
      type: 'boolean',
      required: false,
      defaultsTo: false
    },
    error_message:{
      type: 'string',
      required: false
    },

    items:{
      type: 'json',
      columnType: 'array',
      defaultsTo: []
    }
  },
};
