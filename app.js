const Express = require('express');
const ExpressGraphQL = require('express-graphql');
const Mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require('graphql');

const app = Express();

const db = process.env.DB_HOST;
Mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const EpisodeModel = Mongoose.model('episode', {
  show: String,
  season: String,
  title: String,
  rating: String
});

const EpisodeType = new GraphQLObjectType({
  name: 'Episode',
  fields: {
    id: { type: GraphQLID },
    show: { type: GraphQLString },
    season: { type: GraphQLString },
    title: { type: GraphQLString },
    rating: { type: GraphQLString }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      episodes: {
        type: GraphQLList(EpisodeType),
        resolve: (root, args, context, info) => {
          return EpisodeModel.find().exec();
        }
      },
      episode: {
        type: EpisodeType,
        args: {
          id: { type: GraphQLNonNull(GraphQLID) }
        },
        resolve: (root, args, context, info) => {
          return EpisodeModel.findById(args.id).exec();
        }
      }
    }
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addEpisode: {
        type: EpisodeType,
        args: {
          show: { type: GraphQLNonNull(GraphQLString) },
          season: { type: GraphQLNonNull(GraphQLString) },
          title: { type: GraphQLNonNull(GraphQLString) },
          rating: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, context, info) => {
          const episode = new EpisodeModel(args);
          return episode.save();
        }
      }
    }
  })
});

app.use(cors());

app.use(
  '/graphql',
  ExpressGraphQL({
    schema: schema,
    graphiql: true
  })
);

app.listen(3001, () => {
  console.log('Listening at :3001...');
});
