import { calcularXpPorRango } from '../../src/services/character.service';

describe('calcularXpPorRango', () => {
  const levelReq = { experiencia_requerida: 1000 };
  const expBase = 100;

  const settings = {
    EXP_GLOBAL_MULTIPLIER: 1,
    exp_req_multiplier_por_rango: { D: 1.0, SSS: 3.0 },
    exp_gain_multiplier_por_rango: { D: 1.0, SSS: 2.0 }
  };

  test('rango D debe requerir menos victorias que SSS con mismos parametros', () => {
    const resD = calcularXpPorRango(10, 'D', levelReq, expBase, settings);
    const resSSS = calcularXpPorRango(10, 'SSS', levelReq, expBase, settings);

    expect(resD.xpReqEffective).toBe(1000);
    expect(resD.xpGainEffective).toBe(100);
    expect(resD.victoriasEstimadas).toBeGreaterThan(0);

    expect(resSSS.xpReqEffective).toBe(3000);
    expect(resSSS.xpGainEffective).toBe(200);
    expect(resSSS.victoriasEstimadas).toBeGreaterThan(resD.victoriasEstimadas);
  });
});
