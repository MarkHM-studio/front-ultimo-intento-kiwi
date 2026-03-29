import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Utensils, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight,
  Wine,
  ChefHat
} from 'lucide-react';

export const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-amber-800 font-bold text-lg">LP</span>
              </div>
              <span className="text-xl font-bold">La Pituca</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-amber-100">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-amber-800 hover:bg-amber-100">
                  Registrarse
                </Button>
              </Link>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Bienvenido a <span className="text-amber-300">La Pituca</span>
              </h1>
              <p className="text-xl text-amber-100 mb-8">
                El mejor restobar de Chosica. Disfruta de nuestra deliciosa comida, 
                bebidas y un ambiente acogedor para toda la familia.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Hacer una Reserva
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Acceso Trabajadores
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-amber-800/50 rounded-3xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <Utensils className="h-10 w-10 mx-auto mb-3 text-amber-300" />
                    <p className="font-semibold">Comida de Calidad</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <Wine className="h-10 w-10 mx-auto mb-3 text-amber-300" />
                    <p className="font-semibold">Bebidas Premium</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-amber-300" />
                    <p className="font-semibold">Reservas Online</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-amber-300" />
                    <p className="font-semibold">Ambiente Familiar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir La Pituca?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desde 2021, nos hemos dedicado a ofrecer la mejor experiencia gastronómica 
              en Chosica, combinando bebidas de calidad con exquisita comida a la carta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cocina de Calidad</h3>
                <p className="text-gray-600">
                  Platos preparados con los mejores ingredientes y recetas tradicionales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Horario Extendido</h3>
                <p className="text-gray-600">
                  Atención de 5:00 PM a 2:00 AM. Dos turnos: tarde y noche.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ubicación Privilegiada</h3>
                <p className="text-gray-600">
                  Jirón Chiclayo 388, Chosica. Fácil acceso y ambiente acogedor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-amber-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Visítanos Hoy</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="font-semibold">Dirección</p>
                    <p className="text-amber-100">Jirón Chiclayo 388, Chosica, Perú</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="font-semibold">Horario de Atención</p>
                    <p className="text-amber-100">Lunes a Domingo: 5:00 PM - 2:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-amber-300" />
                  <div>
                    <p className="font-semibold">Teléfono</p>
                    <p className="text-amber-100">+51 987 654 321</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">¿Listo para reservar?</h3>
              <p className="text-amber-100 mb-6">
                Regístrate ahora y haz tu reserva de manera rápida y sencilla.
                Disfruta de la mejor experiencia en La Pituca.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white w-full">
                  Crear Cuenta y Reservar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LP</span>
              </div>
              <span className="text-white font-semibold">La Pituca</span>
            </div>
            <p className="text-sm">
              © 2024 La Pituca Restobar. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
