import { calcularXpPorRango } from '../src/services/character.service';

function assertEqual(a: any, b: any, msg?: string) {
  if (a !== b) {
    console.error('ASSERT FAIL:', msg || '', a, '!==', b);
    process.exit(2);
  }
}

const levelReq = { experiencia_requerida: 1000 };
const expBase = 100;
const settings = {
  EXP_GLOBAL_MULTIPLIER: 1,
  exp_req_multiplier_por_rango: { D: 1.0, SSS: 3.0 },
  exp_gain_multiplier_por_rango: { D: 1.0, SSS: 2.0 }
};

const resD = calcularXpPorRango(10, 'D', levelReq, expBase, settings);
const resSSS = calcularXpPorRango(10, 'SSS', levelReq, expBase, settings);

console.log('resD', resD);
console.log('resSSS', resSSS);

assertEqual(resD.xpReqEffective, 1000, 'D xpReq');
assertEqual(resD.xpGainEffective, 100, 'D xpGain');
assertEqual(resSSS.xpReqEffective, 3000, 'SSS xpReq');
assertEqual(resSSS.xpGainEffective, 200, 'SSS xpGain');

if (resSSS.victoriasEstimadas <= resD.victoriasEstimadas) {
  console.error('ASSERT FAIL: SSS should require more victories than D');
  process.exit(2);
}

console.log('All assertions passed');
