type Gene = { threshold: number; weights: number[]; bias: number };

function geneRandomize() {
  return Math.random() * 2 - 1;
}

export function sigmoid(n: number) {
  return 1 / (1 + Math.exp(-n));
}

class Neuron {
  process(input: number, gene: Gene): number[] {
    const force = sigmoid(input) + gene.bias;

    if (force >= gene.threshold) {
      return gene.weights.map((weight) => weight * force);
    }

    return gene.weights.map((_) => 0);
  }
}

export class MazeMind {
  private inputs: Neuron[];
  private outputs: Neuron[];
  private hiddenLayers: Neuron[][];

  genes: Gene[][];

  constructor(
    inputs: number,
    outputs: number,
    hiddenLayers: number,
    hiddenLayersNeurons: number,
    gene?: Gene[][]
  ) {
    this.inputs = Array.from({ length: inputs }).map((_) => new Neuron());
    this.outputs = Array.from({ length: outputs }).map((_) => new Neuron());
    this.hiddenLayers = Array.from({ length: hiddenLayers }).map((_) =>
      Array.from({ length: hiddenLayersNeurons }).map((_) => new Neuron())
    );

    this.genes =
      gene ??
      Array.from({ length: hiddenLayers + 2 }).map((_, index) => {
        switch (index) {
          case 0:
            return Array.from({ length: inputs }).map((_) => ({
              threshold: geneRandomize(),
              weights: Array.from({ length: hiddenLayersNeurons }).map((_) =>
                geneRandomize()
              ),
              bias: geneRandomize(),
            })) as Gene[];

          case hiddenLayers + 1:
            return Array.from({ length: outputs }).map((_) => ({
              threshold: geneRandomize(),
              weights: [1],
              bias: geneRandomize(),
            })) as Gene[];

          case hiddenLayers:
            return Array.from({ length: hiddenLayersNeurons }).map((_) => ({
              threshold: geneRandomize(),
              weights: Array.from({ length: outputs }).map((_) =>
                geneRandomize()
              ),
              bias: geneRandomize(),
            })) as Gene[];

          default:
            return Array.from({ length: hiddenLayersNeurons }).map((_) => ({
              threshold: geneRandomize(),
              weights: Array.from({ length: hiddenLayersNeurons }).map((_) =>
                geneRandomize()
              ),
              bias: geneRandomize(),
            })) as Gene[];
        }
      });
  }

  feedForward(inputs: number[]): number[] {
    const inputsProcessValues = this.inputs.map((input, index) =>
      input.process(inputs[index], this.genes[0][index])
    );

    let hiddenLayersProcessValues: number[][] = inputsProcessValues;

    let tempHiddenLayersProcessValues: number[][] = [];

    this.hiddenLayers.forEach((layer, layerIndex) => {
      layer.map(
        (neuron, neuronIndex) =>
          (tempHiddenLayersProcessValues[neuronIndex] = neuron.process(
            hiddenLayersProcessValues.reduce(
              (sum, neuronAnswer) => sum + neuronAnswer[neuronIndex],
              0
            ),
            this.genes[layerIndex + 1][neuronIndex]
          ))
      );

      hiddenLayersProcessValues = tempHiddenLayersProcessValues;
    });
    return this.outputs
      .map((output, outputIndex) =>
        output.process(
          hiddenLayersProcessValues.reduce(
            (sum, layerProcess) => sum + layerProcess[outputIndex],
            0
          ),
          this.genes.at(-1)![outputIndex]
        )
      )
      .flat();
  }

  theSauce(probability: number) {
    this.genes = this.genes.map((genes) =>
      genes.map((gene) => {
        const newGene = gene;

        if (Math.random() < probability) {
          newGene.bias += Math.random() * 0.8 - 0.4;
        }

        if (Math.random() < probability) {
          newGene.threshold += Math.random() * 0.8 - 0.4;
        }

        newGene.weights.map(
          (weight) =>
            weight +
            (Math.random() < probability ? Math.random() * 0.8 - 0.4 : 0)
        );

        return newGene;
      })
    );
  }
}
