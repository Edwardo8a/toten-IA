# Integración Frontend: Kotlin (Android / Jetpack Compose)

Guía para conectar una aplicación **Android nativa en Kotlin** (para quioscos, tablets o app de administración) con el backend CQRS de Café Lobo.

---

## 1. Dependencias (`build.gradle.kts`)

```kotlin
dependencies {
    // Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")

    // Jetpack Compose
    implementation("androidx.compose.material3:material3:1.3.0")
}
```

---

## 2. Modelos de Datos (`Models.kt`)

```kotlin
package com.cafelobo.totem.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    @SerializedName("token_type") val tokenType: String,
    @SerializedName("expires_in") val expiresIn: String
)

data class Producto(
    val id: String,
    val nombre: String,
    val categoria: String?,
    val precio: Double,
    val costo: Double,
    val activo: Boolean,
    @SerializedName("loyverse_handle") val loyverseHandle: String?
)

data class Descuento(
    val id: String,
    val name: String,
    val type: String,
    @SerializedName("discount_percent") val discountPercent: Double?,
    @SerializedName("discount_amount") val discountAmount: Double?
)

data class AfinidadResponse(
    @SerializedName("producto_target") val target: Any?,
    @SerializedName("productos_afines") val afines: List<ProductoAfin>
)

data class ProductoAfin(
    val nombre: String,
    val sku: String?,
    @SerializedName("veces_juntos") val vecesJuntos: Int,
    @SerializedName("porcentaje_afinidad") val porcentajeAfinidad: String,
    val score: Int
)
```

---

## 3. Interfaz Retrofit y Autenticación (`ApiService.kt`)

```kotlin
package com.cafelobo.totem.data.api

import com.cafelobo.totem.data.model.*
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface CafeLoboApi {
    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): LoginResponse

    @GET("productos")
    suspend fun getProductos(@Query("categoria") categoria: String? = null): List<Producto>

    @POST("productos")
    suspend fun crearProducto(@Body producto: Map<String, Any>): Map<String, Any>

    @GET("descuentos")
    suspend fun getDescuentos(): List<Descuento>

    @POST("descuentos")
    suspend fun crearDescuento(@Body descuento: Map<String, Any>): Descuento

    @GET("estadisticas/afinidad")
    suspend fun getAfinidad(@Query("producto_id") productoId: String): AfinidadResponse
}

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val requestBuilder = chain.request().newBuilder()
        tokenProvider()?.let { token ->
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }
        return chain.proceed(requestBuilder.build())
    }
}

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:4000/api/" // IP local o emulador

    var authToken: String? = null

    val api: CafeLoboApi by lazy {
        val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor { authToken })
            .addInterceptor(logging)
            .build()

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CafeLoboApi::class.java)
    }
}
```

---

## 4. ViewModel con Corrutinas y StateFlow (`TotemViewModel.kt`)

```kotlin
package com.cafelobo.totem.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cafelobo.totem.data.api.ApiClient
import com.cafelobo.totem.data.model.Producto
import com.cafelobo.totem.data.model.ProductoAfin
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class TotemUiState {
    object Loading : TotemUiState()
    data class Success(val productos: List<Producto>, val sugerencia: ProductoAfin?) : TotemUiState()
    data class Error(val mensaje: String) : TotemUiState()
}

class TotemViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<TotemUiState>(TotemUiState.Loading)
    val uiState = _uiState.asStateFlow()

    fun cargarCatalogoYSugerencia(productoIdSeleccionado: String? = null) {
        viewModelScope.launch {
            try {
                _uiState.value = TotemUiState.Loading
                val productos = ApiClient.api.getProductos()

                var sugerencia: ProductoAfin? = null
                if (productoIdSeleccionado != null) {
                    val afinidad = ApiClient.api.getAfinidad(productoIdSeleccionado)
                    sugerencia = afinidad.afines.firstOrNull()
                }

                _uiState.value = TotemUiState.Success(productos, sugerencia)
            } catch (e: Exception) {
                _uiState.value = TotemUiState.Error(e.message ?: "Error desconocido")
            }
        }
    }
}
```

---

## 5. UI en Jetpack Compose (`TotemScreen.kt`)

```kotlin
package com.cafelobo.totem.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun TotemScreen(viewModel: TotemViewModel) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.cargarCatalogoYSugerencia()
    }

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("☕ Tótem Café Lobo") }) }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).padding(16.dp)) {
            when (val s = state) {
                is TotemUiState.Loading -> CircularProgressIndicator()
                is TotemUiState.Error -> Text("Error: ${s.mensaje}", color = MaterialTheme.colorScheme.error)
                is TotemUiState.Success -> {
                    Column {
                        s.sugerencia?.let { afin ->
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("💡 Te sugerimos agregar:", style = MaterialTheme.typography.titleMedium)
                                    Text("${afin.nombre} (${afin.porcentajeAfinidad} de compra conjunta)")
                                }
                            }
                        }

                        LazyColumn {
                            items(s.productos) { prod ->
                                ListItem(
                                    headlineContent = { Text(prod.nombre) },
                                    supportingContent = { Text(prod.categoria ?: "") },
                                    trailingContent = { Text("$${prod.precio}") }
                                )
                                HorizontalDivider()
                            }
                        }
                    }
                }
            }
        }
    }
}
```
