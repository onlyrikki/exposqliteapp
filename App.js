import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

//Dependencies to Install for the database: npx expo install expo-sqlite
//After the installation, import everything from expo sqlite

export default function App() {
  useEffect(() => {
    async () => {
      // await createTable();
    }, []
  });

  //To display the list when the application start
  useEffect (() => {
    createTable();
    getDatabaseItems();
  }, []);
 
  //Initializes the database
  const myDatabase = SQLite.openDatabase('myDBName');

  //Create a table in the database
  const createTable = () => {
    myDatabase.transaction(tx => {
      //SQL Command that will create a new table IF IT DOES NOT EXIST
      //Make sure that if you will add a new column to the table, you NEED TO CREATE A NEW one so CHANGE THE TABLE NAME, ADD THE COLUMN, THEN RUN THE APPLICATION (Temporary solution, we will still look for a way that would let us add a new column without creating a new table)
      tx.executeSql('CREATE TABLE IF NOT EXISTS ItemWithDesc (id INTEGER PRIMARY KEY AUTOINCREMENT, itemName VARCHAR(20), itemDesc VARCHAR(20))')
    })
  };

  //Variable that stores the value entered by the user on the textbox
  const [userInput, setUserInput] = useState ("");
  const [userDesc, setUserDesc] = useState ("");

  //Variable that stores the database items
  const [items, setItems] = useState([]);

  //Function called when the button is pressed to add the entered value to the database
  const addToDatabase = () => {
    myDatabase.transaction(tx => {
      tx.executeSql('INSERT INTO ItemWithDesc (itemName, itemDesc) VALUES (?, ?)', [userInput, userDesc],
      //If command run successfully
      (sqlTx, res) => {
        console.log('Item Successfully added to the database');
        getDatabaseItems();
      },
      //If encountered an error
      error => {console.log('Error in adding inputitem ' + error.message)
      })
      //Resets the input fields
      setUserInput("");
      setUserDesc("");
    })
  };

  //Function to show the items in the database
  const getDatabaseItems = () => {
    myDatabase.transaction(tx => {
      //SQL Command to display the rows in descending order by its id
      tx.executeSql('SELECT * FROM ItemWithDesc ORDER BY id DESC', [],
      //If command run successfully
      (sqlTx, res) => {
        console.log('Successfully fetched ItemWithDesc from the database');
        let len = res.rows.length;

        if (len > 0) {
          let results = [];
          for (let i = 0; len > i; i++){
            let item = res.rows.item(i);
            results.push({ id: item.id, itemName: item.itemName, itemDesc: item.itemDesc }) // id is the Primary Key itemName is the column name
          }

          setItems(results);
        }
      },
      //If encountered an error
      error => {console.log('Error in adding item' + error.message)
      })
    })
  }
  //Function to display the items
  const renderItems = ({ item }) => { //item is constant
    return (
      <Text>{item.id} {item.itemName} {item.itemDesc}</Text>
    )
  }

  return (
    <View style={styles.container}>
      <Text>Enter Something to add to the Database</Text>
      <TextInput 
        placeholder='Enter Text Here!'
        style = {{marginTop: 16, fontSize: 16}}
        //Sets the value entered in the textbox to the variable named 'userInput'
        value={userInput}
        //Sets the new value of userInput by the entered value
        onChangeText={setUserInput}
      />
            <TextInput 
        placeholder='Enter Desc Here!'
        style = {{marginTop: 16, fontSize: 16}}
        //Sets the value entered in the textbox to the variable named 'userInput'
        value={userDesc}
        //Sets the new value of userInput by the entered value
        onChangeText={setUserDesc}
      />
      <Button 
        title='Add to Database'
        //Calls the function addToDatabase and run it
        onPress={addToDatabase}
      />
      <FlatList
      data={items} 
      renderItem={renderItems}
      key={items => items.id}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 100,
    paddingHorizontal: 35,
    backgroundColor: '#fff',
  },
});
