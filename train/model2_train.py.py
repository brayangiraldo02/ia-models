from __future__ import absolute_import, division, print_function, unicode_literals

import tensorflow as tf
import tensorflow_datasets as tfds
import math
import logging

logger = tf.get_logger()
logger.setLevel(logging.ERROR)

# Cargar el conjunto de datos EMNIST (por clase)
dataset, metadata = tfds.load('emnist/byclass', as_supervised=True, with_info=True)
train_dataset, test_dataset = dataset['train'], dataset['test']

# Definir las clases (números y letras)
class_names = [chr(i) for i in range(48, 58)] + [chr(i) for i in range(65, 91)] + [chr(i) for i in range(97, 123)]

num_train_examples = metadata.splits['train'].num_examples
num_test_examples = metadata.splits['test'].num_examples

# Normalizar las imágenes
def normalize(images, labels):
    images = tf.cast(images, tf.float32)
    images /= 255
    return images, labels

train_dataset = train_dataset.map(normalize)
test_dataset = test_dataset.map(normalize)

# Aumentar la complejidad de la red
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(len(class_names)) # Sin activación softmax aquí
])

# Compilar el modelo
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), # Especificar que los logits no están activados por softmax
    metrics=['accuracy']
)

# Aprendizaje por lotes de 64 cada lote
BATCHSIZE = 64
train_dataset = train_dataset.shuffle(num_train_examples).batch(BATCHSIZE).repeat()
test_dataset = test_dataset.batch(BATCHSIZE).repeat()

# Callback personalizado para guardar estadísticas
class CustomCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        with open('training_stats.txt', 'a') as f:
            f.write(f"Epoch: {epoch + 1}, Accuracy: {logs['accuracy']:.4f}, "
                    f"Loss: {logs['loss']:.4f}, Val_Accuracy: {logs['val_accuracy']:.4f}, "
                    f"Val_Loss: {logs['val_loss']:.4f}\n")
        self.model.save('emnist_final_model.h5')

# Guardar el modelo después de cada época
checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
    filepath='emnist_final_model.keras',
    save_weights_only=False,
    save_best_only=False,
    save_freq='epoch'
)

# Realizar el entrenamiento
model.fit(
    train_dataset, epochs=100, # Aumentar el número de épocas
    steps_per_epoch=math.ceil(num_train_examples/BATCHSIZE),
    validation_data=test_dataset,
    validation_steps=math.ceil(num_test_examples/BATCHSIZE),
    callbacks=[CustomCallback(), checkpoint_callback]
)

# Guardar el modelo entrenado
model.save('emnist_final_model_1.keras')