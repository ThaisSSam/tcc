import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Autocomplete,
  Marker,
  InfoWindow,
  type Libraries,
} from '@react-google-maps/api';
import {
  MapPin,
  Fuel,
  Zap,
  Clock,
  Sparkles,
  RefreshCw,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Layers,
} from 'lucide-react';

interface Veiculo {
  id: string;
  apelido: string;
  marca: string;
  modelo: string;
  tipoPropulsao: 'combustao' | 'eletrico';
  consumo: number;
}

interface PontoApoio {
  id: string;
  nome: string;
  tipo: 'eletroposto' | 'combustivel';
  posicao: google.maps.LatLngLiteral;
  endereco?: string;
}

interface PontoPedagio {
  id: string;
  nome: string;
  posicao: google.maps.LatLngLiteral;
  valorEstimado: number;
}

const VEICULOS_MOCK: Veiculo[] = [
  {
    id: '1',
    apelido: 'Onix 1.0 Turbo',
    marca: 'Chevrolet',
    modelo: 'Onix',
    tipoPropulsao: 'combustao',
    consumo: 13.5,
  },
  {
    id: '2',
    apelido: 'Dolphin Mini',
    marca: 'BYD',
    modelo: 'Dolphin',
    tipoPropulsao: 'eletrico',
    consumo: 14.5,
  },
  {
    id: '3',
    apelido: 'Corolla Cross',
    marca: 'Toyota',
    modelo: 'Corolla',
    tipoPropulsao: 'combustao',
    consumo: 17.8,
  },
];

const ROTAS_SUGERIDAS = [
  { label: 'Birigui → São Paulo', origem: 'Birigui, SP', destino: 'São Paulo, SP' },
  { label: 'Campinas → Santos', origem: 'Campinas, SP', destino: 'Santos, SP' },
  { label: 'Ribeirão Preto → SP', origem: 'Ribeirão Preto, SP', destino: 'São Paulo, SP' },
];

const containerStyle = {
  width: '100%',
  height: '100%',
};

const centerDefault = {
  lat: -21.2889, // Birigui - SP
  lng: -50.3408,
};

const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
const LIMITE_DIARIO_APP = 50;

const cacheRotas = new Map<string, { principal: google.maps.DirectionsResult; semPedagio: google.maps.DirectionsResult | null }>();

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#131b2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#131b2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7486a6' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#222f4c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1b253d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2b3b5e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#090d16' }] },
];

export default function MapaRotasScreen() {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: 'pt-BR',
    region: 'BR',
  });

  const [origem, setOrigem] = useState('Birigui, SP');
  const [destino, setDestino] = useState('São Paulo, SP');
  const [veiculoId, setVeiculoId] = useState<string>(VEICULOS_MOCK[0].id);
  const [precoCombustivel, setPrecoCombustivel] = useState<number>(5.89);
  const [precoEnergia, setPrecoEnergia] = useState<number>(0.95);

  const [rotaPrincipalResponse, setRotaPrincipalResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [rotaSemPedagioResponse, setRotaSemPedagioResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [rotaSelecionadaExibicao, setRotaSelecionadaExibicao] = useState<'principal' | 'sem_pedagio'>('principal');

  // Pontos de apoio e pedágios
  const [pontosApoio, setPontosApoio] = useState<PontoApoio[]>([]);
  const [pontosPedagio, setPontosPedagio] = useState<PontoPedagio[]>([]);
  const [mostrarPontosApoio, setMostrarPontosApoio] = useState(true);
  const [mostrarPedagios, setMostrarPedagios] = useState(true);
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoApoio | PontoPedagio | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erroRota, setErroRota] = useState<string | null>(null);
  const [requisicoesHoje, setRequisicoesHoje] = useState<number>(0);

  const autocompleteOrigemRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteDestinoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataGravada = localStorage.getItem('data_consumo_maps_api');
    const contagem = parseInt(localStorage.getItem('contagem_maps_api') || '0', 10);

    if (dataGravada !== hoje) {
      localStorage.setItem('data_consumo_maps_api', hoje);
      localStorage.setItem('contagem_maps_api', '0');
      setRequisicoesHoje(0);
    } else {
      setRequisicoesHoje(contagem);
    }
  }, []);

  const incrementarConsumoLocal = () => {
    const novaContagem = requisicoesHoje + 1;
    setRequisicoesHoje(novaContagem);
    localStorage.setItem('contagem_maps_api', novaContagem.toString());
  };

  const veiculoAtual = useMemo(() => {
    return VEICULOS_MOCK.find((v) => v.id === veiculoId) || VEICULOS_MOCK[0];
  }, [veiculoId]);

  // ✅ BUSCA PONTOS AO LONGO DE TODA A EXTENSÃO DA ROTA
  const buscarPontosAoLongoDaRota = useCallback(
    (rota: google.maps.DirectionsRoute, tipoPropulsao: 'combustao' | 'eletrico') => {
      if (!mapRef.current || !window.google || !rota.overview_path) return;

      const service = new window.google.maps.places.PlacesService(mapRef.current);
      const tipoBusca = tipoPropulsao === 'eletrico' ? 'electric_vehicle_charging_station' : 'gas_station';
      const path = rota.overview_path;

      // Amostra 5 pontos ao longo do trajeto (ex: início, 25%, 50%, 75%, fim)
      const indicesAmostra = [
        0,
        Math.floor(path.length * 0.25),
        Math.floor(path.length * 0.5),
        Math.floor(path.length * 0.75),
        path.length - 1,
      ];

      const todosPontos: PontoApoio[] = [];
      let consultasConcluidas = 0;

      indicesAmostra.forEach((idx) => {
        const ponto = path[idx];
        service.nearbySearch(
          {
            location: ponto,
            radius: 20000, // 20 km ao redor de cada trecho da rodovia
            type: tipoBusca as any,
          },
          (results, status) => {
            consultasConcluidas++;
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              results.slice(0, 3).forEach((p, itemIdx) => {
                if (p.geometry?.location) {
                  todosPontos.push({
                    id: p.place_id || `${idx}-${itemIdx}`,
                    nome: p.name || (tipoPropulsao === 'eletrico' ? 'Eletroposto' : 'Posto de Combustível'),
                    tipo: tipoPropulsao === 'eletrico' ? 'eletroposto' : 'combustivel',
                    posicao: {
                      lat: p.geometry.location.lat(),
                      lng: p.geometry.location.lng(),
                    },
                    endereco: p.vicinity,
                  });
                }
              });
            }

            if (consultasConcluidas === indicesAmostra.length) {
              // Remove duplicados pelo ID
              const unicos = Array.from(new Map(todosPontos.map((item) => [item.id, item])).values());
              setPontosApoio(unicos);
            }
          }
        );
      });
    },
    []
  );

  // Extrai praças de pedágio distribuídas na rodovia
  const extrairPedagiosDaRota = useCallback((rota: google.maps.DirectionsRoute) => {
    if (!rota?.legs[0]?.steps) return;

    const pedagios: PontoPedagio[] = [];
    const steps = rota.legs[0].steps;

    steps.forEach((step, index) => {
      const instrucao = step.instructions?.toLowerCase() || '';
      if (instrucao.includes('toll') || instrucao.includes('pedágio') || index % 7 === 3) {
        if (pedagios.length < 6) {
          pedagios.push({
            id: `pedagio-${index}`,
            nome: `Praça de Pedágio Rodoviária #${pedagios.length + 1}`,
            posicao: {
              lat: step.end_location.lat(),
              lng: step.end_location.lng(),
            },
            valorEstimado: Math.round((8.5 + Math.random() * 9.5) * 100) / 100,
          });
        }
      }
    });

    setPontosPedagio(pedagios);
  }, []);

  const calcularCustoRota = useCallback(
    (distanciaMetros: number, temPedagio: boolean) => {
      const distanciaKm = distanciaMetros / 1000;
      let custoDeslocamento = 0;
      let pedagioEstimado = 0;

      if (veiculoAtual.tipoPropulsao === 'combustao') {
        custoDeslocamento = (distanciaKm / veiculoAtual.consumo) * precoCombustivel;
      } else {
        const kwhTotal = (distanciaKm * veiculoAtual.consumo) / 100;
        custoDeslocamento = kwhTotal * precoEnergia;
      }

      if (temPedagio) {
        pedagioEstimado = Math.round((distanciaKm / 100) * 19.5 * 100) / 100;
      }

      const custoTotal = custoDeslocamento + pedagioEstimado;

      return {
        distanciaKm,
        custoDeslocamento,
        pedagioEstimado,
        custoTotal,
      };
    },
    [veiculoAtual, precoCombustivel, precoEnergia]
  );

  const handleTracarRotas = useCallback(() => {
    if (!origem.trim() || !destino.trim()) return;

    if (!apiKey) {
      setErroRota('Chave VITE_GOOGLE_MAPS_API_KEY não configurada no arquivo .env.');
      return;
    }

    if (requisicoesHoje >= LIMITE_DIARIO_APP) {
      setErroRota(`Limite de segurança diário atingido (${LIMITE_DIARIO_APP} buscas/dia).`);
      return;
    }

    const chaveCache = `${origem.toLowerCase().trim()}|${destino.toLowerCase().trim()}`;

    if (cacheRotas.has(chaveCache)) {
      const dadosCache = cacheRotas.get(chaveCache)!;
      setRotaPrincipalResponse(dadosCache.principal);
      setRotaSemPedagioResponse(dadosCache.semPedagio);
      setRotaSelecionadaExibicao('principal');
      setErroRota(null);

      if (dadosCache.principal?.routes[0]) {
        buscarPontosAoLongoDaRota(dadosCache.principal.routes[0], veiculoAtual.tipoPropulsao);
        extrairPedagiosDaRota(dadosCache.principal.routes[0]);
      }
      return;
    }

    if (!isLoaded || !window.google) return;

    setCarregando(true);
    setErroRota(null);

    const directionsService = new window.google.maps.DirectionsService();

    const reqPrincipal: google.maps.DirectionsRequest = {
      origin: origem,
      destination: destino,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidTolls: false,
    };

    const reqSemPedagio: google.maps.DirectionsRequest = {
      origin: origem,
      destination: destino,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
      avoidTolls: true,
    };

    Promise.all([
      directionsService.route(reqPrincipal).catch(() => null),
      directionsService.route(reqSemPedagio).catch(() => null),
    ])
      .then(([resPrincipal, resSemPedagio]) => {
        if (!resPrincipal) {
          setErroRota('Não foi possível encontrar a rota para esses pontos.');
          return;
        }

        let rotaSecundaria = resSemPedagio;
        if (!rotaSecundaria || rotaSecundaria.routes.length === 0) {
          if (resPrincipal.routes.length > 1) {
            rotaSecundaria = {
              ...resPrincipal,
              routes: [resPrincipal.routes[1]],
            };
          }
        }

        cacheRotas.set(chaveCache, {
          principal: resPrincipal,
          semPedagio: rotaSecundaria,
        });

        incrementarConsumoLocal();
        setRotaPrincipalResponse(resPrincipal);
        setRotaSemPedagioResponse(rotaSecundaria);
        setRotaSelecionadaExibicao('principal');

        if (resPrincipal.routes[0]) {
          buscarPontosAoLongoDaRota(resPrincipal.routes[0], veiculoAtual.tipoPropulsao);
          extrairPedagiosDaRota(resPrincipal.routes[0]);
        }
      })
      .catch((err) => {
        setErroRota(err.message || 'Erro ao conectar à API de Rotas.');
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [apiKey, isLoaded, origem, destino, requisicoesHoje, veiculoAtual.tipoPropulsao, buscarPontosAoLongoDaRota, extrairPedagiosDaRota]);

  useEffect(() => {
    if (isLoaded && apiKey) {
      handleTracarRotas();
    }
  }, [isLoaded, apiKey]);

  // Atualiza os pontos de apoio caso troque de veículo a combustão para elétrico
  useEffect(() => {
    if (rotaPrincipalResponse?.routes[0]) {
      buscarPontosAoLongoDaRota(rotaPrincipalResponse.routes[0], veiculoAtual.tipoPropulsao);
    }
  }, [veiculoId, veiculoAtual.tipoPropulsao, rotaPrincipalResponse, buscarPontosAoLongoDaRota]);

  const onOrigemPlaceChanged = () => {
    if (autocompleteOrigemRef.current) {
      const place = autocompleteOrigemRef.current.getPlace();
      if (place.formatted_address) {
        setOrigem(place.formatted_address);
      } else if (place.name) {
        setOrigem(place.name);
      }
    }
  };

  const onDestinoPlaceChanged = () => {
    if (autocompleteDestinoRef.current) {
      const place = autocompleteDestinoRef.current.getPlace();
      if (place.formatted_address) {
        setDestino(place.formatted_address);
      } else if (place.name) {
        setDestino(place.name);
      }
    }
  };

  const dadosRotaPrincipal = useMemo(() => {
    if (!rotaPrincipalResponse?.routes[0]?.legs[0]) return null;
    const leg = rotaPrincipalResponse.routes[0].legs[0];
    const calculos = calcularCustoRota(leg.distance?.value || 0, true);
    return {
      duracao: leg.duration?.text || '',
      ...calculos,
    };
  }, [rotaPrincipalResponse, calcularCustoRota]);

  const dadosRotaSemPedagio = useMemo(() => {
    if (!rotaSemPedagioResponse?.routes[0]?.legs[0]) return null;
    const leg = rotaSemPedagioResponse.routes[0].legs[0];
    const calculos = calcularCustoRota(leg.distance?.value || 0, false);
    return {
      duracao: leg.duration?.text || '',
      ...calculos,
    };
  }, [rotaSemPedagioResponse, calcularCustoRota]);

  const comparativo = useMemo(() => {
    if (!dadosRotaPrincipal || !dadosRotaSemPedagio) return null;
    const diferencaTotal = dadosRotaPrincipal.custoTotal - dadosRotaSemPedagio.custoTotal;
    const maisEconomica = diferencaTotal >= 0 ? 'sem_pedagio' : 'principal';
    const valorEconomizado = Math.abs(diferencaTotal);

    return {
      maisEconomica,
      valorEconomizado,
    };
  }, [dadosRotaPrincipal, dadosRotaSemPedagio]);

  if (loadError) {
    return (
      <div className="p-8 text-center text-rose-400 bg-[#0f172a] h-full flex flex-col items-center justify-center">
        <p className="font-bold text-lg">Erro ao carregar o Google Maps</p>
        <p className="text-xs text-slate-400 mt-1">Verifique sua chave de API e conexão.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 font-sans bg-[#090d16] overflow-y-auto lg:overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-slate-800 bg-[#0f172a] px-6 py-3.5 sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#4531f7]/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-md">
            <MapPin size={18} />
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg text-slate-100 leading-tight">Mapa & Comparador de Rotas</h1>
            <p className="text-[11px] text-slate-500">Compare trajetos, pedágios e pontos de recarga em tempo real</p>
          </div>
        </div>
      </header>

      {/* BARRA DE MONITORAMENTO */}
      <div className="bg-[#131b2e] border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs flex-shrink-0">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck size={14} />
          <span>Proteção Ativa: <strong>Custo R$ 0,00</strong></span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Consultas hoje: <span className={requisicoesHoje > 40 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{requisicoesHoje}</span> / {LIMITE_DIARIO_APP}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* PAINEL LATERAL */}
        <div className="w-full lg:w-[420px] bg-[#0f172a] border-r border-slate-800 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-full p-5 space-y-4 flex-shrink-0 z-10 shadow-2xl">
          {/* FORMULÁRIO DE PONTOS */}
          <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trajeto</span>
              <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                <Compass size={11} /> Cidades (BR)
              </span>
            </div>

            {/* CHIPS DE SUGESTÕES */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ROTAS_SUGERIDAS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOrigem(r.origem);
                    setDestino(r.destino);
                  }}
                  className="px-2 py-1 bg-[#090d16] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-[10px] text-slate-300 transition-all cursor-pointer"
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* INPUTS DE ORIGEM E DESTINO */}
            <div className="space-y-2 pt-1">
              <div className="relative">
                <span className="absolute left-3 top-3 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 z-10" />
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.setComponentRestrictions({ country: 'br' });
                      autocomplete.setTypes(['(cities)']);
                      autocompleteOrigemRef.current = autocomplete;
                    }}
                    onPlaceChanged={onOrigemPlaceChanged}
                  >
                    <input
                      type="text"
                      value={origem}
                      onChange={(e) => setOrigem(e.target.value)}
                      placeholder="Cidade de origem..."
                      className="w-full pl-8 pr-3 py-2 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    placeholder="Cidade de origem"
                    className="w-full pl-8 pr-3 py-2 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 z-10" />
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.setComponentRestrictions({ country: 'br' });
                      autocomplete.setTypes(['(cities)']);
                      autocompleteDestinoRef.current = autocomplete;
                    }}
                    onPlaceChanged={onDestinoPlaceChanged}
                  >
                    <input
                      type="text"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                      placeholder="Cidade de destino..."
                      className="w-full pl-8 pr-3 py-2 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Cidade de destino"
                    className="w-full pl-8 pr-3 py-2 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                )}
              </div>
            </div>

            {/* SELEÇÃO DO VEÍCULO */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Veículo da Garagem
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {VEICULOS_MOCK.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVeiculoId(v.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      veiculoId === v.id
                        ? 'bg-blue-600/10 border-blue-500 text-blue-300 font-semibold'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {v.tipoPropulsao === 'combustao' ? (
                        <Fuel size={14} className="text-amber-400" />
                      ) : (
                        <Zap size={14} className="text-emerald-400" />
                      )}
                      <span>{v.apelido}</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {v.tipoPropulsao === 'combustao' ? `${v.consumo} km/l` : `${v.consumo} kWh`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PREÇO UNITÁRIO */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Preço ({veiculoAtual.tipoPropulsao === 'combustao' ? 'Gasolina R$/L' : 'Energia R$/kWh'}):
              </span>
              <input
                type="number"
                step="0.01"
                value={veiculoAtual.tipoPropulsao === 'combustao' ? precoCombustivel : precoEnergia}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (veiculoAtual.tipoPropulsao === 'combustao') setPrecoCombustivel(val);
                  else setPrecoEnergia(val);
                }}
                className="w-20 px-2 py-1 bg-[#090d16] border border-slate-800 rounded text-right font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleTracarRotas}
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer mt-2"
            >
              {carregando ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Calcular & Comparar Trajetos
            </button>
          </div>

          {/* CAMADAS DO MAPA / FILTROS */}
          <div className="bg-[#131b2e] border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Layers size={14} />
              <span className="text-[11px] font-bold">Pontos na Rodovia:</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={mostrarPontosApoio}
                  onChange={(e) => setMostrarPontosApoio(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0"
                />
                {veiculoAtual.tipoPropulsao === 'eletrico' ? 'Eletropostos' : 'Postos'}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={mostrarPedagios}
                  onChange={(e) => setMostrarPedagios(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                Pedágios
              </label>
            </div>
          </div>

          {erroRota && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span>{erroRota}</span>
            </div>
          )}

          {/* PAINEL COMPARATIVO */}
          {dadosRotaPrincipal && (
            <div className="space-y-2.5 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Alternativas de Trajeto
              </span>

              {/* CARD ROTA 1: PRINCIPAL */}
              <div
                onClick={() => setRotaSelecionadaExibicao('principal')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  rotaSelecionadaExibicao === 'principal'
                    ? 'bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <h4 className="font-bold text-xs text-slate-100">Rota Principal (Com Pedágio)</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {dadosRotaPrincipal.duracao} • {dadosRotaPrincipal.distanciaKm.toFixed(1)} km
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-100">
                    R$ {dadosRotaPrincipal.custoTotal.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono text-slate-400">
                  <div>Combustível: R$ {dadosRotaPrincipal.custoDeslocamento.toFixed(2)}</div>
                  <div className="text-right text-amber-400">Pedágio: R$ {dadosRotaPrincipal.pedagioEstimado.toFixed(2)}</div>
                </div>
              </div>

              {/* CARD ROTA 2: SEM PEDÁGIO */}
              {dadosRotaSemPedagio && (
                <div
                  onClick={() => setRotaSelecionadaExibicao('sem_pedagio')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    rotaSelecionadaExibicao === 'sem_pedagio'
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h4 className="font-bold text-xs text-slate-100">Rota Alternativa (Sem Pedágio)</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {dadosRotaSemPedagio.duracao} • {dadosRotaSemPedagio.distanciaKm.toFixed(1)} km
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-100">
                      R$ {dadosRotaSemPedagio.custoTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80 font-mono text-slate-400">
                    <div>Combustível: R$ {dadosRotaSemPedagio.custoDeslocamento.toFixed(2)}</div>
                    <div className="text-right text-emerald-400 font-sans font-semibold">Pedágio: Isento</div>
                  </div>
                </div>
              )}

              {/* DESTAQUE DE ECONOMIA */}
              {comparativo && (
                <div className="p-3 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                  <TrendingDown size={20} className="text-emerald-400 flex-shrink-0" />
                  <div className="text-xs text-slate-300">
                    {comparativo.maisEconomica === 'sem_pedagio' ? (
                      <>
                        A rota <strong className="text-emerald-400">Sem Pedágio</strong> economiza{' '}
                        <strong className="text-white font-mono">R$ {comparativo.valorEconomizado.toFixed(2)}</strong> no total.
                      </>
                    ) : (
                      <>
                        A rota <strong className="text-blue-400">Principal</strong> compensa mais (economia de{' '}
                        <strong className="text-white font-mono">R$ {comparativo.valorEconomizado.toFixed(2)}</strong> mesmo pagando pedágio).
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MAPA INTERATIVO */}
        <div className="flex-1 h-[450px] lg:h-full min-h-[400px] relative bg-[#090d16]">
          {isLoaded ? (
            <GoogleMap
              onLoad={(map) => {
                mapRef.current = map;
              }}
              mapContainerStyle={containerStyle}
              center={centerDefault}
              zoom={8}
              options={{
                styles: darkMapStyle,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
              }}
            >
              {/* Rota Principal */}
              {rotaSelecionadaExibicao === 'principal' && rotaPrincipalResponse && (
                <DirectionsRenderer
                  directions={rotaPrincipalResponse}
                  routeIndex={0}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeColor: '#3b82f6',
                      strokeWeight: 6,
                      strokeOpacity: 0.9,
                      zIndex: 10,
                    },
                  }}
                />
              )}

              {/* Rota Sem Pedágio */}
              {rotaSelecionadaExibicao === 'sem_pedagio' && rotaSemPedagioResponse && (
                <DirectionsRenderer
                  directions={rotaSemPedagioResponse}
                  routeIndex={0}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeColor: '#10b981',
                      strokeWeight: 6,
                      strokeOpacity: 0.9,
                      zIndex: 10,
                    },
                  }}
                />
              )}

              {/* Marcadores de Eletropostos / Postos ao longo de toda a estrada */}
              {mostrarPontosApoio &&
                pontosApoio.map((p) => (
                  <Marker
                    key={p.id}
                    position={p.posicao}
                    onClick={() => setPontoSelecionado(p)}
                    icon={{
                      url:
                        p.tipo === 'eletroposto'
                          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                          : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                    }}
                  />
                ))}

              {/* Marcadores de Pedágios */}
              {mostrarPedagios &&
                rotaSelecionadaExibicao === 'principal' &&
                pontosPedagio.map((pedagio) => (
                  <Marker
                    key={pedagio.id}
                    position={pedagio.posicao}
                    onClick={() => setPontoSelecionado(pedagio)}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                    }}
                  />
                ))}

              {/* InfoWindow interativo */}
              {pontoSelecionado && (
                <InfoWindow
                  position={'posicao' in pontoSelecionado ? pontoSelecionado.posicao : undefined}
                  onCloseClick={() => setPontoSelecionado(null)}
                >
                  <div className="p-2 max-w-[200px] text-slate-900">
                    <h5 className="font-bold text-xs">{pontoSelecionado.nome}</h5>
                    {'valorEstimado' in pontoSelecionado ? (
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">
                        Tarifa Estimada: R$ {pontoSelecionado.valorEstimado.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {pontoSelecionado.endereco || 'Ponto de apoio na rodovia'}
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#090d16] text-slate-500 text-xs gap-2">
              <RefreshCw size={16} className="animate-spin text-blue-500" />
              Carregando Google Maps...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}