const axios = require('axios');
const fs = require('fs/promises');
const fetch = require('node-fetch');
const Realm = require('realm');
const path = require('path');
const { exec } = require('child_process');

const ExerciseSchema = {
  name: 'Exercise',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', indexed: true },
    bodyPart: { type: 'string' },
    equipment: { type: 'string', indexed: true },
    mediaFileName: 'string?',
    name: { type: 'string', indexed: true },
    target: { type: 'string', indexed: true },
    instructions: { type: 'list', objectType: 'string' },  // Fixed array type definition
  },
};

const downloadGif = async (url, filePath) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
};

const convertGifToMp4 = async (gifFilePath, mp4FilePath) => {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${gifFilePath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4FilePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error converting GIF to MP4: ${stderr}`);
      } else {
        resolve(mp4FilePath);
      }
    });
  });
};

const fetchAndStoreExercises = async () => {
  try {
    const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises?offset=0&limit=0', {
      headers: {
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        'x-rapidapi-key': '98527f0b1cmsh1a0c1b3d5b52558p1139efjsnfde98a12cfb5',
      },
    });

    const exercises = response.data;
    
    // Create base directories
    const baseDir = path.join(process.cwd(), 'assets');
    const realmDir = path.join(baseDir, 'realm');
    const mediaDir = path.join(baseDir, 'media');
    const gifsDir = path.join(mediaDir, 'gifs');
    const mp4sDir = path.join(mediaDir, 'mp4s');

    // Ensure directories exist
    await fs.mkdir(baseDir, { recursive: true });
    await fs.mkdir(realmDir, { recursive: true });
    await fs.mkdir(mediaDir, { recursive: true });
    await fs.mkdir(gifsDir, { recursive: true });
    await fs.mkdir(mp4sDir, { recursive: true });

    const realmPath = path.join(realmDir, 'prepopulated.realm');
    const realm = new Realm({ schema: [ExerciseSchema], path: realmPath });

    for (const exercise of exercises) {
      const mediaFileName = `${exercise.id}.mp4`;
      const gifPath = path.join(gifsDir, `${exercise.id}.gif`);
      const mp4Path = path.join(mp4sDir, mediaFileName);

      // Download and convert media
      await downloadGif(exercise.gifUrl, gifPath);
      await convertGifToMp4(gifPath, mp4Path);

      // Clean up GIF file after conversion
      await fs.unlink(gifPath);

      // Save exercise data in Realm
      realm.write(() => {
        realm.create('Exercise', {
          id: exercise.id,
          bodyPart: exercise.bodyPart,
          equipment: exercise.equipment,
          mediaFileName: mediaFileName,
          name: exercise.name,
          target: exercise.target,
          instructions: exercise.instructions || [],
        }, Realm.UpdateMode.Modified);
      });
    }

    realm.close();

    // Create a manifest file with directory structure info
    const manifest = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      directories: {
        realm: 'assets/realm',
        media: 'assets/media/mp4s',
      }
    };

    await fs.writeFile(
      path.join(baseDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('Exercise data fetched, converted, and stored successfully.');
  } catch (error) {
    console.error('Error fetching exercises:', error);
  }
};

fetchAndStoreExercises();