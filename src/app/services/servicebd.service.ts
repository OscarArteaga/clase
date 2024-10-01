import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {

  //variable de conexión a la Base de Datos
  public database!: SQLiteObject;

  //variables de creación de tablas
  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";

  //variables de insert por defecto
  registroNoticia: string = "INSERT or IGNORE INTO noticia(idnoticia, titulo, texto) VALUES (1,'Soy un titulo de la noticia', 'Soy el contenido completo de toda la primera noticia insertada en la BD')";

  //variables tipo observables para manipular los registros de la base de datos
  listaNoticias = new BehaviorSubject([]);

  //variable observable para el estatus de la base de datos
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  

  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController) {
    this.crearBD()
   }

  crearBD(){
    //verificar si la plataforma está lista
    this.platform.ready().then(()=>{
      //crear la base de datos
      this.sqlite.create({
        name: 'bdnoticias.db',
        location: 'default'
      }).then((bd: SQLiteObject)=>{
        //guardar la conexion a la base de datos
        this.database = bd;
        //llamar a la creación de las tablas
        this.crearTablas();
        //modificar el estado de la base de datos
        this.isDBReady.next(true);
      }).catch(e=>{
        this.presentAlert('CrearBD','Error: ' + JSON.stringify(e));
      })
    })

  }

  async crearTablas(){
    try{
      //ejecuto la creación de tablas en orden
      await this.database.executeSql(this.tablaNoticia, []);

      //ejecuto los insert en caso que existan
      await this.database.executeSql(this.registroNoticia, []);

    }catch(e){
      this.presentAlert('CrearTabla','Error: ' + JSON.stringify(e));
    }

  }

  async presentAlert(titulo:string, msj:string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  fetchNoticias(): Observable<Noticias[]>{
    return this.listaNoticias.asObservable();
  }

  dbState(){
    return this.isDBReady.asObservable();
  }

}
