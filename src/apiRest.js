/*Elements HTML */
/*span error */
const span = document.getElementById("error");
/*Spawn button */
const button = document.querySelector(".query-button"); 
button.addEventListener("click", showCatPicture); //genera una búsqueda nueva de gatos
/*Spawn cats container*/
const randomSection = document.querySelector(".show-random-container");
/*Favorite cats container*/
const favoriteSection = document.querySelector(".show-favorites-container");
//Select img to favorites
const selectedImgFavorite = [];//Guarda imágenes seleccionadas
const uploadImgSend = []; //Guarda la imágen subida 

/* global queary variable */
let data;

/*API variables*/
const API = "https://api.thecatapi.com/v1/images/search?limit=4";
const APIFavorite = "https://api.thecatapi.com/v1/favourites";
const APIFavoriteDelete = "https://api.thecatapi.com/v1/favourites/";
const API_key ="live_swlCiQ2zrjigeFch1ZiFXdEQyNIU7wWze8fQxpSLVPRKXHWktuQ9Y9Zq18yUQgRL";
const API_upload = "https://api.thecatapi.com/v1/images/upload";

//Ejemplo con axios
const apiAxio = axios.create({
    baseURL:"https://api.thecatapi.com/v1",
    headers: {
        "X-API-KEY": "live_swlCiQ2zrjigeFch1ZiFXdEQyNIU7wWze8fQxpSLVPRKXHWktuQ9Y9Zq18yUQgRL",
    }
});


//Aquí se muestran las imágenes de gatos consultados a la API
async function showCatPicture(){
    const btnSaveFavorite = document.getElementById("saveFavorite");
    const btnUpload = document.getElementById("upload-button");
    btnUpload.addEventListener("click", openUploadMenu);

    //Se crea agrega un evento al botón para ejecutar la acción de guardar favoritos
    btnSaveFavorite.onclick = () => saveFavorite();

    try{
        const response = await fetch(API);
        data = await response.json();
        btnSaveFavorite.classList.replace("button--disabled", "button--enabled");
        btnUpload.classList.replace("button--disabled", "button--enabled");
        
        //Si ya hay imágenes de gatos cargadas las reemplazará por otras
        if(randomSection.childNodes.length > 1){
            //Se obtienen todas las etiquetas img de la sección random
            const replaceImgId = document.querySelectorAll(".show-random-container img");
           
            //Luego reemplazamos la url de cada una de ella por las nuevas url obtenidas
           
            data.forEach((element, index) => {               
                replaceImgId[index].src = element.url;
                replaceImgId[index].id = element.id;
            });
                
        }
        //Si no hay imágenes de gatos cargadas anteriormente, las creará desde cero.
        else{
            const fragment = new DocumentFragment();
            for(const item of data){
                //Elemet creation
                const article = document.createElement("article");
                article.addEventListener("click", selectImgRandom); //click a los artículos genera evento de selección
                const img = document.createElement("img");
                //Add nodes and attributes
                img.src = item.url;
                img.id = item.id;
                article.appendChild(img);   
                fragment.append(article);      
            }
            randomSection.append(fragment);
        }              
    }  
    catch(e){
        span.innerText = e;
    }
}
//función donde se seleccionan las imágenes a las que demos click
function selectImgRandom(event){
    //Si hay una imagen seleccionada
    if(selectedImgFavorite.length){

        const imgAdded = event.path[0];
        //Valida si la nueva imagen seleccionada concuerda con la selección actual o no
        if( selectedImgFavorite[0].src === imgAdded.src){
            //Si ya existe una imagen seleccionada será eliminada del array
            selectedImgFavorite.shift();
            //Eliminamos el marco de selección actual
            imgAdded.classList.toggle("show-random-container__img--selected");  
        }
        else{
            selectedImgFavorite[0].classList.toggle("show-random-container__img--selected");
            selectedImgFavorite.shift();
            //Agregamos al array nuestras imágenes seleccionadas
            selectedImgFavorite.push(imgAdded);
            imgAdded.classList.toggle("show-random-container__img--selected");
        }

    }
    //Si no hay imagen seleccionada
    else{
        //Guardamos la imagen seleccionada
        const imgAdded = event.path[0];
        console.log(imgAdded);
        //Agregamos la clase que pone el marco de selección al darle click
        imgAdded.classList.toggle("show-random-container__img--selected");    
        //Agregamos al array nuestra imagen seleccionada
        selectedImgFavorite.push(imgAdded);       
    }
   
}

async function uploadImg(){
    try{
        const img = document.createElement("img");
        const form = document.getElementById("upload-Img");
        const dataForm = new FormData(form);

        const response = await fetch(API_upload, {
            method: "POST",
            headers: {
                /* "Content-Type": "multipart/form-data", */
                "X-API-KEY" : API_key,     
            },
            body: dataForm, 
        });
        const dataUpload = await response.json();
        img.id = dataUpload.id;
        uploadImgSend[0] = img; //Guarda la etiqueta <img>
        selectedImgFavorite.push(img);//Esto es necesario para evitar el error de leer valores undefined en saveFavorite()
        saveFavorite();
    }
    catch(e){
        console.log(e);
    }
}

//detección de evento al subir una imagen en el input del formulario
document.getElementById("file").onchange = function (event) {
   
    let reader = new FileReader(); //instancia del objeto reader
    reader.readAsDataURL(event.target.files[0]);//Una vez cargado el archivo, guardamos su url
    //onload, este evento permite realizar unas acciones una vez el archivo cargue
    reader.onload = function(){
        //Extraemos el elemento html donde se guardará la imagen
        let preview = document.getElementById("img-view-container");
        //Se crea la etiqueta <img> para guardar la imagen y se asigna una clase
        image = document.createElement("img");
        image.classList.add("img-view-container__img");
        image.src = reader.result; //asignamos el url de la imagen subida
        preview.append(image);
    }

    
};

//Aquí se realiza el envió a la API de las imágenes que se guardarán en favoritos
async function saveFavorite(){
  
    try{
        //Se límita la cantidad de imágenes de gatos guardados a 6
        const replaceImg = document.querySelectorAll(".show-favorites-container article img");
        const preview = document.getElementById("img-view-container");
        const imgLoaded = document.querySelector(".img-view-container__img");
        if(replaceImg.length >= 6){
            span.innerText = "You can only save six cats";
        }
        //Si hay espacio, entonce se hace el envío a la API
        else{
            if(selectedImgFavorite.length){//Debe haber una imagen seleccionada
                for (const item of data) {
                    //En esta validación se previene un cambio malintencionado al id de la imagen desde el inspector de elementos
                    if((item.id === selectedImgFavorite[0].id)|| uploadImgSend[0] ){//Se valida si hay una imagen subida o seleccionada
                      
                        //Ejempl con Axio
                        /*  const res = await apiAxio.post("/favourites", {
                        image_id: selectedImgFavorite[0].id,
                       })
                       console.log(res); */

                         const response = await fetch(APIFavorite, {
                            method : "POST",
                            mode: "cors",
                            headers:{
                                "Content-Type" : "application/json",
                                "X-API-KEY": "live_swlCiQ2zrjigeFch1ZiFXdEQyNIU7wWze8fQxpSLVPRKXHWktuQ9Y9Zq18yUQgRL",
                            },
                            body:JSON.stringify({image_id : selectedImgFavorite[0].id})
                        });
                        let dataSent = await response.json();

                        uploadImgSend[0] = 0; //esto pondrá en false la condición de arriba
                        span.innerText = dataSent.message;
                        
                    }         
                }  
                showFavorite(); 
                //La imagen que se solicitó guardar en favoritos debe ser des-seleccionada y sacada de la lista
                selectedImgFavorite[0].classList.toggle("show-random-container__img--selected");
                //Removemos la imágen del menú de subir archivo
                if(imgLoaded){
                    preview.removeChild(imgLoaded); 
                }
               
                 
            }
            else{
                span.innerText = "You must select a cat to send";
            }   
        }
    }
    catch(e){
        console.log(e);
    }
}

//Aquí se consulta los gatos favoritos que fueron enviados al backend de la API, el backend reconoce al usuario por su key
//de autenticación y guarda la información enviada por POST
async function showFavorite(){
    try{
        const fragment = new DocumentFragment();
        //Consulta a la API para traer las imágenes guardadas en favoritos
        const response = await fetch(APIFavorite, {
            method: "GET",
            headers: {
                "X-API-KEY": API_key, 
            }
        });  
        let dataQuery = await response.json();
        //Se valida si existen imágenes en la sección de favoritos
        if(favoriteSection.childNodes.length > 1){
            
            let replaceImg = document.querySelectorAll(".show-favorites-container article img");
            const article = document.querySelectorAll(".show-favorites-container article");
            const img = document.createElement("img");
            const newArticle = document.createElement("article");
            newArticle.addEventListener("click", selectImgRandom); //Se aplica evento de selección por click a cada artículo
            //Mostrar sección luego de eliminar la imagen de un gato
            replaceImg.forEach((img, index)=> {
                
                if(img.id === selectedImgFavorite[0].id){
                    
                    favoriteSection.removeChild(article[index]);  
                    replaceImg = document.querySelectorAll(".show-favorites-container article img");  
                    
                }
            });
           
            selectedImgFavorite.shift(); 
            //Mostrar sección luego de agregar imagen de un gato
            dataQuery.forEach((item, index) => {
                
                replaceImg[index] ? 
                (
                    //Si existe una etiqueta img en la posición del index, entonces reemplazará la información de cada una 
                    replaceImg[index].src = item.image.url,
                    replaceImg[index].id = item.id    
                )
                :
                (   
                    //Si no existe otra etiqueta img en la posición del index, entonces creará una nueva 
                    img.src = item.image.url,
                    img.id = item.id,
                    newArticle.append(img),                
                    favoriteSection.append(newArticle)       
                );
            });
        }
         //Mostrar apenas cargue la página estando la sección vacía
        else{
            //Se creará el botón de remove para agregarlo como hijo a la section contenedora de favoritos
            const favoriteSectionContainer = document.querySelector(".favorite-cats-container");
            const btnRemove = document.createElement("button");
            btnRemove.classList.add("remove-button");
            btnRemove.innerText = "Remove cat";
            //Se crea el evento escuchador para mostrar
            btnRemove.onclick = () => deleteFavorite();
          
            for (const item of dataQuery) {
                //Element creation           
                const article = document.createElement("article");
                article.addEventListener("click", selectImgRandom);//Se aplica evento de selección por click
                const img = document.createElement("img");
                //Add nodes and attributes
                img.src = item.image.url;
                img.id = item.id ;
                article.appendChild(img);   
                fragment.append(article);     
            }
            favoriteSection.append(fragment);
            favoriteSectionContainer.appendChild(btnRemove);
        }  
    }
    catch(e){
        console.log(e);
    }   
}
//Aquí se eliminan de favoritos las imágenes de gatos que el usuario elija
async function deleteFavorite(){
    console.log("id de gato mandado a borrar", selectedImgFavorite[0].id)
    try{
        replaceImg = document.querySelectorAll(".show-favorites-container article img");
        //Se comienzan 
        if(selectedImgFavorite.length){
            const response = await fetch(APIFavoriteDelete+selectedImgFavorite[0].id, {
                method : "DELETE",
                mode : "cors", 
                headers: {
                    "X-API-KEY": API_key,
                }
            });
            let dataSent = await response.json();
            console.log(dataSent.message);
            //La imagen que se solicitó eliminar en favoritos debe ser des-seleccionada y sacada de la lista
            selectedImgFavorite[0].classList.toggle("show-random-container__img--selected");
            showFavorite();     
                
        }
        else{
            span.innerText = "You must select a cat to remove";
        }
        
    }
    catch(e){
        span.innerText = "error occurred "+e;
    }
}
//Las funciones a continuación abren y cierra el aside-menú de donde se carga una imagen
function openUploadMenu(){
    const menu = document.querySelector(".upload-aside");
    menu.classList.toggle("button--disabled");
    const closeUploadMenu = document.querySelector(".close-menu");
    closeUploadMenu.addEventListener("click", closeMenu);
}
function closeMenu(){
    const menu = document.querySelector(".upload-aside");
    menu.classList.toggle("button--disabled");
}
//Carga las imágenes de la sección random y la sección favorites
showCatPicture()
showFavorite();

	