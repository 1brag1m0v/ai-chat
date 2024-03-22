import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import { Prism } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Animatable from 'react-native-animatable';
// api key sk-ff6aa93c89f74573b6381b7c19494165
import { PacmanIndicator } from 'react-native-indicators';
import { Dropdown } from 'react-native-element-dropdown';
import { ToastProvider, useToast, Toast } from 'react-native-toast-notifications';

const api_key = 'sk-ff6aa93c89f74573b6381b7c19494165'

export default function App() {

  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [request, setRequest] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [model, setModel] = useState('Ничего не выбрано')
  const [isProg, setIsProg] = useState(false)

  const ToastNotification = () => {
    const toast = useToast();
    useEffect(() => {
      toast.show("Модель изменена на генерацию кода.");
    }, [])
  }

  const generatedResult = () => {
    Keyboard.dismiss()
    setLoading(true)
    let data = JSON.stringify({
      "messages": [
        {
          "content": "",
          "role": "system"
        },
        {
          "content": request,
          "role": "user"
        }
      ],
      "model": model,
      "frequency_penalty": 0,
      "max_tokens": 2048,
      "presence_penalty": 0,
      "stop": null,
      "stream": false,
      "temperature": 1,
      "top_p": 1
    });
  
    
    let config = {
      method: 'post',
    maxBodyLength: Infinity,
      url: 'https://api.deepseek.com/v1/chat/completions',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'Authorization': `Bearer ${api_key}`
      },
      data : data
    };
    
    axios(config)
    .then((response) => {
      setResult(response.data.choices[0].message.content.trim());
      setLoading(false)
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <ToastProvider animationDuration={150} placement='bottom' animationType='slide-in' successColor='green' dangerColor='red' duration={2000} offsetBottom={50}>
      <SafeAreaView style={styles.container}>
      <Animatable.View animation={'fadeIn'} duration={1500} style={{flexDirection: 'row', margin: 10, width: '90%', justifyContent: 'center', alignItems: 'center', padding: 20, borderRadius: 20}}>
        <TextInput placeholderTextColor={'white'} onChangeText={text => {setRequest(text)}} style={{borderWidth: 1, borderColor: 'white', color: 'white', borderRadius: 20, padding: 10, margin: 10, width: '60%'}} placeholder='Введите запрос'/>
        <TouchableOpacity disabled={loading ? true : false} onPress={generatedResult} style={{borderWidth: 1, borderRadius: 20, borderColor: 'white', padding: 10, margin: 10}}>
          <Text style={{color: 'white'}}>Отправить</Text>
        </TouchableOpacity>
      </Animatable.View>
      <Animatable.View animation={'fadeIn'} duration={1500} style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '90%'}}>
        <Text style={{color: 'white'}}>Выбранная модель: {isProg ? 'Код' : 'Общение'}</Text>
      <TouchableOpacity onPress={() => {
        setModalVisible(true)
      }} style={{}}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Выбрать модель</Text>
        </TouchableOpacity>
      </Animatable.View>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {<PacmanIndicator color='white'/>}
          <Text style={{color: 'white', marginVertical: 20}}>Загрузка может занять некоторое время...</Text>
        </View>
      ) : (
      <View style={{flex: 1, padding: 10, marginTop: 20, borderWidth: 0, borderRadius: 10, width: '90%', height: '60%', backgroundColor: '#414350', justifyContent: 'center', alignItems: 'center'}}>  
        <ScrollView style={{width: '100%', padding: 10, borderRadius: 20}}>
            <FinishResult request={request} result={result}/>
        </ScrollView>
      </View>
      )}
      <StatusBar style="light" />
      <Modal visible={modalVisible} animationType='slide' onRequestClose={() => {setModalVisible(false)}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121525'}}>
        <TouchableOpacity onPress={() => {
          setModalVisible(false)
          setModel('deepseek-coder')
          setIsProg(true)
          Toast.show('Модель успешно изменена на генерацию кода.', {type: 'success'})
          //Alert.alert('Успешно', 'Модель изменена на генерацию кода.')
        }} style={{borderWidth: 1, marginVertical: 10, borderColor: 'white', padding: 15, borderRadius: 10}}>
          <Text style={{color: 'white'}}>Генерация кода</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setModalVisible(false)
          setModel('deepseek-chat')
          setIsProg(false)
          Toast.show('Модель успешно изменена на общение.', {type: 'success'})
          //Alert.alert('Успешно', 'Модель изменена на общение')
        }} style={{borderWidth: 1, marginVertical: 10, borderColor: 'white', padding: 15, borderRadius: 10}}>
          <Text style={{color: 'white'}}>Общение с ИИ</Text>
        </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
    </ToastProvider>
  );
}

function ModalScreen() {
  return (
    <Modal/>
  );
}

function FinishResult({request, result}) {

  const renderers = {
    code: ({language, value}) => (
      <Prism language={language} style={duotoneDark}>
        {value}
      </Prism>
    )
  }
  //const text = result.toString()
  return (
    <View style={{marginBottom: 20}}>
      <Markdown style={markdownStyles} renderers={renderers}>{result}</Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121525',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 10
  },
});

const markdownStyles = StyleSheet.create({
  text: {
    color: 'white',
  },
  // Добавьте другие стили, если нужно
});
