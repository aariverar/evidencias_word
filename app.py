import tkinter as tk
import customtkinter as ctk
import babel.numbers #no eliminar, ya que es necesario incluir en pyinstaller
from tkinter import ttk
from logic.variables import *
from PIL import Image, ImageTk
from logic.utilities import *
from ui.styles import *

root = tk.Tk()
icon_path = resource_path('assets/icons/logo_santander_ico.ico')
root.wm_iconbitmap(icon_path)
root.configure(bg=font_dark_color)
root.title("Reporte de Evidencias")
root.geometry("1045x640")
root.resizable(False, False)

# Variable para almacenar la opción seleccionada en el Combobox
opcion_seleccionada_estado = tk.StringVar()
ruta_seleccionada = tk.StringVar()

#Funcion para limpiar los campos del form
def limpiar_campos():
    # Limpiar los campos de entrada (Entry)
    for var_entry in variables_entries.values():
        var_entry.set("")

    # Reiniciar los Combobox
    opcion_seleccionada_estado.set("")  # Reiniciar el Combobox de estado

def agregar_a_tabla(tabla):
    # Verificar si todos los campos tienen contenido
    campos = [var_entry.get() for var_entry in variables_entries.values()]
    campos.extend([opcion_seleccionada_estado.get(), ruta_seleccionada.get()])
    if "" in campos:  # Si alguno de los campos está vacío
        crear_popup("Archivo Excel Generado","Error: Debe completar todos los campos, incluyendo carpeta de imágenes.",close=True )
        return
    
    global datos
    fila = []
    for texto, var_entry in variables_entries.items():
        contenido = var_entry.get()
        fila.append(contenido)

    fila.append(opcion_seleccionada_estado.get())
    fila.append(ruta_seleccionada.get())  # Agregar la ruta a la fila
    datos.append(fila)
    
    # Solo agregar la nueva fila a la tabla si la longitud de la tabla y la lista de datos no coinciden
    if len(tabla.get_children()) != len(datos):
        insertar_datos(tabla, [fila])

def cargar_campos(event):
    # Obtener la fila seleccionada
    item = tabla.selection()[0]
    values = tabla.item(item, "values")

    # Cargar los valores en los Entry y Combobox correspondientes
    for i, (nombre_campo, var_entry) in enumerate(variables_entries.items()):
        var_entry.set(values[i])

    opcion_seleccionada_estado.set(values[5])  # Cargar el valor de estado en el Combobox
    ruta_seleccionada.set(values[6]) # Cargar la ruta de la imagen
    boton_actualizar.grid(row=0, column=0, padx=5, pady=0)

def actualizar_campos():
    # Obtener los valores de los Entry actualizados
    nuevos_valores = [var_entry.get() for var_entry in variables_entries.values()]

    # Actualizar los valores de la fila seleccionada en la tabla
    item = tabla.selection()[0]
    tabla.item(item, values=nuevos_valores)

    # Actualizar los valores de los Combobox en la tabla
    tabla.set(item, "#6", opcion_seleccionada_estado.get())  # Actualizar el Combobox de estado
    # Actualizar el campo de la imagen en la tabla
    tabla.set(item, "#7", ruta_seleccionada.get())  # Actualizar el campo de la imagen

    # Ocultar el botón de "Actualizar"
    boton_actualizar.grid_forget()
    boton_borrar_fila.grid_forget()

def mostrar_botones(event):
    # Obtener la fila seleccionada
    seleccion = tabla.selection()
    # Verificar si se ha seleccionado una fila
    if seleccion:
        boton_borrar_fila.grid(row=0, column=2, padx=5, pady=0)
        boton_actualizar.grid(row=0, column=1, padx=5, pady=0)
    else:
        boton_actualizar.grid_forget()
        boton_borrar_fila.grid_forget()
     
def cargar_campos_y_mostrar_botones(event):
    cargar_campos(event)
    mostrar_botones(event)

#############################################################################################################################
frame0 = tk.Frame(root, bg=font_gray_color)
frame0.grid(row=0, column=0, padx=10, pady=0, sticky='nsew')
frame0.columnconfigure(0, weight=1)
frame0.columnconfigure(1, weight=1)
frame0.rowconfigure(0, weight=1)

# título y logo
logo_path = resource_path('assets/images/logo_santander.png')
image_mibanco = Image.open(logo_path)

new_size_mibanco = (100, 60)  # Nuevo tamaño en píxeles
image_mibanco = image_mibanco.resize(new_size_mibanco, Image.LANCZOS)

# Convertir la imagen de PIL a una imagen de Tkinter
tk_image_mibanco = ImageTk.PhotoImage(image_mibanco)

# Crear un Label con la imagen de mibanco
image_label_mibanco = tk.Label(frame0, image=tk_image_mibanco, bd=0, fg = font_gray_color, bg=font_gray_color)
image_label_mibanco.image_mibanco = tk_image_mibanco
image_label_mibanco.grid(row=0, column=0, padx=10, pady=5, sticky="we")

principal_title = tk.Label(frame0, text="Reporte de Evidencias", font=mi_fuente_tittle, bg=font_gray_color,fg=font_light_color , anchor="center")
principal_title.grid(row=0, column=1, padx=(10,0), pady=5,sticky="w")

frame1 = tk.Frame(root, bg=font_dark_color)
frame1.grid(row=1, column=0, padx=10, pady=0, sticky='nsew')
frame1.columnconfigure(0, weight=1)
frame1.columnconfigure(1, weight=1)
frame1.columnconfigure(2, weight=1)
frame1.rowconfigure(0, weight=1)

options_frame = tk.Frame(frame1, bg=font_gray_color)
options_frame.grid(row=0, column=0, padx=0, pady=10, sticky='nsew')
options_frame.columnconfigure(0, weight=1)

options_buttons = tk.Frame(frame1, bg=font_dark_color)
options_buttons.grid(row=0, column=1, padx=10, pady=10, sticky='nsew')
options_buttons.rowconfigure(0, weight=1)
options_buttons.rowconfigure(1, weight=1)
options_buttons.rowconfigure(2, weight=1)
options_buttons.columnconfigure(0, weight=1)

image_frame = tk.Frame(frame1, bg=font_gray_color)
image_frame.grid(row=0, column=2, padx=2, pady=10, sticky='nsew')
image_frame.rowconfigure(0, weight=1)
image_frame.columnconfigure(0, weight=1)

image_path = resource_path('assets/images/logo_santander_scb.png')
image_calidad = Image.open(image_path)

new_size_calidad = (320, 220)
image_calidad = image_calidad.resize(new_size_calidad, Image.LANCZOS)

# Convertir la imagen de PIL a una imagen de Tkinter
tk_image_calidad = ImageTk.PhotoImage(image_calidad)

image_label_calidad = tk.Label(image_frame, image=tk_image_calidad, bd=0, fg = font_gray_color, bg=font_gray_color)
image_label_calidad.image_calidad = tk_image_calidad
image_label_calidad.grid(row=0, column=0, padx=2, pady=10, sticky="wens")

frame2 = tk.Frame(root, bg=font_gray_color)
frame2.grid(row=2, column=0, padx=10, pady=0, sticky='nsew')
frame2.columnconfigure(0, weight=1)
frame2.columnconfigure(1, weight=1)
frame2.rowconfigure(0, weight=1)
frame2.rowconfigure(1, weight=1)

options_table = tk.Frame(frame2, bg=font_gray_color)
options_table.rowconfigure(0, weight=1)
options_table.columnconfigure(0, weight=1)
options_table.columnconfigure(1, weight=1)
options_table.grid(row=0, column=0, padx=2, pady=5, sticky='nswe')

buttons_options_table = tk.Frame(options_table)
buttons_options_table.configure(bg=font_gray_color)
buttons_options_table.grid(row=0, column=1, padx=(10,5), pady=2, sticky='e')

frame3 = tk.Frame(root, bg=font_gray_color)
frame3.grid(row=3, column=0, padx=10, pady=0, sticky='nswe')
frame3.columnconfigure(0, weight=1)
frame3.rowconfigure(0, weight=1)
#Label Copyright
copy_label = tk.Label(frame3, text="©️Santander Consumer Bank - Equipo de Calidad", font=mi_fuente_copyright,bg=font_gray_color, fg=font_light_color, anchor="center")
copy_label.grid(row=0, column=0, padx=10, pady=10,sticky='nsew')
#########################################

#Crear label para SPRINT
sprint_frame = tk.Frame(options_frame, bg=font_gray_color)
sprint_frame.grid(row=1, column=0, pady=2, padx=5, sticky="nswe")
crear_campos(sprint_frame,"CICLO","Ciclo o Sprint: ")

#Crear label para ANALISTA
analista_frame = tk.Frame(options_frame, bg=font_gray_color)
analista_frame.grid(row=2, column=0, pady=2, padx=5, sticky="nswe")
crear_campos(analista_frame,"ANALISTA","Analista QA: ")

#Crear label para CASO PRUEBA
casoprueba_frame = tk.Frame(options_frame, bg=font_gray_color)
casoprueba_frame.grid(row=3, column=0, pady=2, padx=5, sticky="nswe")
crear_campos(casoprueba_frame,"CASOPRUEBA","Caso de Prueba: ")

# Crear el label para proyecto o equipo
squad_frame= tk.Frame(options_frame, bg=font_gray_color)
squad_frame.grid(row=4, column=0, pady=2, padx=5, sticky="nswe")
crear_campos(squad_frame,"PROYECTO", "Proyecto o Equipo: ")

#Crear label para FECHA
fecha_frame = tk.Frame(options_frame, bg=font_gray_color)
fecha_frame.grid(row=5, column=0, pady=2, padx=5, sticky="nswe")
fecha_frame.rowconfigure(0, weight=1)
fecha_frame.columnconfigure(0, weight=1)
fecha_frame.columnconfigure(1, weight=1)

var_entry = tk.StringVar()
calendar_label = tk.Label(fecha_frame, text="Fecha de Ejecución:", width=20, anchor="w",bg=font_gray_color, font=mi_fuente_little, fg=font_light_color)
calendar_label.grid(row=0, column=0, padx=(5,2), pady=5, sticky="nswe")

entry_fecha = ctk.CTkEntry(fecha_frame, textvariable=var_entry, width=80, height=25, state="readonly",fg_color=font_light_color, bg_color=font_gray_color, font=mi_fuente_little, corner_radius=corner_button_radius, border_color=font_light_color)
entry_fecha.grid(row=0, column=1, padx=2, pady=5, sticky="we")

boton_calendar = ctk.CTkButton(fecha_frame, text="📆", command=lambda: seleccionar_fecha(root, var_entry), fg_color=font_dark_color, width=24, height=24, font=mi_fuente_calendar, text_color= font_light_color, corner_radius= corner_button_radius, cursor=cursor_button_type, hover_color= font_dark_color)
boton_calendar.grid(row=0, column=2, padx=(2,5), pady=5, sticky="nswe")

variables_entries["FECHA"] = var_entry

# Crear el Combobox para seleccionar ESTADO
estado_frame= tk.Frame(options_frame, bg=font_gray_color)
estado_frame.grid(row=6, column=0, pady=2, padx=5, sticky="nswe")
crear_combobox(estado_frame,"ESTADO","Estado: ",opcionesEstado,opcion_seleccionada_estado)

# Crear el Treeview para mostrar la tabla
style = ttk.Style()
style.configure("Treeview.Heading", font=mi_fuente_bold, foreground=font_dark_color) 
style.configure("Treeview", font=mi_fuente_little, foreground=font_dark_color)

tabla = ttk.Treeview(frame2, height=7, columns=campos_tabla, show="headings", style="Treeview")
for columna in campos_tabla:
    tabla.heading(columna, text=columna)
    tabla.column(columna, stretch=True, minwidth=60, width=110)
    if columna == "IMG":
        tabla.column(columna, stretch=True, minwidth=120, width=180)
    if columna == "CASOPRUEBA":
        tabla.column(columna, stretch=True, minwidth=100, width=180)
    if columna == "PROYECTO":
        tabla.column(columna, stretch=True, minwidth=120, width=150)
    if columna == "CICLO":
        tabla.column(columna, stretch=True, minwidth=120, width=150)

tabla.grid(row=1, column= 0, padx=5, sticky='nsew', pady=(2,5))

# Scrollbar vertical para la tabla
scrollbar = ttk.Scrollbar(frame2, orient="vertical", command=tabla.yview)
scrollbar.grid(row=1, column=1, sticky="ns", padx=5, pady=(2,5))
tabla.configure(yscrollcommand=scrollbar.set)

####botones principales
boton_ruta_label = tk.Label(options_buttons, text="Seleccionar carpeta de imágenes", bg=font_dark_color, fg=iniciar_button_color, font=mi_fuente_bold)      
boton_ruta_label.grid(row=0, column=0, padx=2, pady=(5,2), sticky="we")

boton_ruta = ctk.CTkButton(options_buttons, text="📂", command=lambda: seleccionar_ruta(ruta_seleccionada),width=folder_width, height=folder_height, font=mi_fuente_folder, border_color=font_dark_color, fg_color=font_gray_color, border_width=ctk_border_width, text_color= font_light_color, corner_radius= folder_corner_radius, border_spacing=border_button_spacing, hover_color = font_gray_color, cursor=cursor_button_type)
boton_ruta.grid(row=1, column=0, padx=2, pady=(2,5), sticky='we')

# Botón para limpiar los campos de entrada y reiniciar los Combobox
boton_limpiar_label = tk.Label(options_buttons, text="Limpiar campos",bg=font_dark_color, fg=iniciar_button_color, font=mi_fuente_bold)
boton_limpiar_label.grid(row=2, column=0, pady=(5,2), padx=2, sticky='we')

boton_limpiar = ctk.CTkButton(options_buttons, text='🔙', command=limpiar_campos,width=folder_width, height=folder_height, font=mi_fuente_folder, border_color=font_dark_color, fg_color=font_gray_color, border_width=ctk_border_width, text_color= font_light_color, corner_radius= folder_corner_radius, border_spacing=border_button_spacing, hover_color = font_gray_color, cursor=cursor_button_type)
boton_limpiar.grid(row=3, column=0, padx=2, pady=(2,5), sticky='we')

boton_agregar_label = tk.Label(options_buttons, text="Agregar caso de prueba", bg=font_dark_color, fg=iniciar_button_color, font=mi_fuente_bold)      
boton_agregar_label.grid(row=4, column=0, padx=2, pady=(5,2), sticky="we")

boton_agregar = ctk.CTkButton(options_buttons, text="📋", command=lambda: agregar_a_tabla(tabla),width=folder_width, height=folder_height, font=mi_fuente_folder, border_color=font_dark_color, fg_color=font_gray_color, border_width=ctk_border_width, text_color= font_light_color, corner_radius= folder_corner_radius, border_spacing=border_button_spacing, hover_color = font_gray_color, cursor=cursor_button_type)
boton_agregar.grid(row=5, column=0, padx=2, pady=(2,5), sticky='we')

#Frame Controladores 
contro_frame= tk.Frame(options_table, bg=font_gray_color)
contro_frame.grid(row=0, column=0, padx=10, pady=2, sticky='w')

# Crear el botón de "Actualizar" (oculto inicialmente)
boton_actualizar = ctk.CTkButton(contro_frame, text="Actualizar", command=actualizar_campos,width=ctk_button_width, height=ctk_button_height, font=mi_fuente_button, border_color=border_color, fg_color=font_dark_color, border_width=ctk_border_width, text_color= font_light_color, corner_radius= corner_button_radius, border_spacing=border_button_spacing, hover_color = font_gray_color, cursor=cursor_button_type)
boton_actualizar.grid(row=0, column=0, padx=5, pady=0)
boton_actualizar.grid_forget() 

# Crear el botón para borrar una fila
boton_borrar_fila = ctk.CTkButton(contro_frame, text="Borrar Fila", command=lambda: borrar_fila(tabla, boton_actualizar, boton_borrar_fila),width=ctk_button_width, height=ctk_button_height, font=mi_fuente_button, border_color=border_color, fg_color=font_dark_color, border_width=ctk_border_width, text_color= font_light_color, corner_radius= corner_button_radius, border_spacing=border_button_spacing, hover_color = font_gray_color, cursor=cursor_button_type)
boton_borrar_fila.grid(row=0, column=1, padx=5, pady=0)
boton_borrar_fila.grid_forget() 

# Botón para generar documentos de Word
boton_generar = ctk.CTkButton(buttons_options_table, text="Generar Documentos", command=lambda: generar_documentos(tabla),fg_color=iniciar_button_color, width=ctk_button_width, height=ctk_button_height, font=mi_fuente_button, text_color= font_dark_color, corner_radius= corner_button_radius, cursor=cursor_button_type, hover_color= options_button_hover_color)
boton_generar.grid(row=0, column=0, padx=5, pady=0)

# Botón para generar un archivo Excel
boton_excel = ctk.CTkButton(buttons_options_table, text="Generar Excel", command=lambda: generar_excel(tabla),fg_color=iniciar_button_color, width=ctk_button_width, height=ctk_button_height, font=mi_fuente_button, text_color= font_dark_color, corner_radius= corner_button_radius, cursor=cursor_button_type, hover_color= options_button_hover_color)
boton_excel.grid(row=0, column=1, padx=5, pady=0)

# Crear el botón para cargar desde Excel
boton_cargar_excel = ctk.CTkButton(buttons_options_table, text="Cargar desde Excel", command=lambda: cargar_desde_excel(tabla),fg_color=iniciar_button_color, width=ctk_button_width, height=ctk_button_height, font=mi_fuente_button, text_color= font_dark_color, corner_radius= corner_button_radius, cursor=cursor_button_type, hover_color= options_button_hover_color)
boton_cargar_excel.grid(row=0, column=2, padx=5, pady=0)

# Vincular la función cargar_campos al evento de selección de fila en la tabla
tabla.bind("<<TreeviewSelect>>", cargar_campos_y_mostrar_botones)

root.mainloop()