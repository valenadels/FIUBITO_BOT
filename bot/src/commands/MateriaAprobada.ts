import { CommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType, ApplicationCommandOptionChoiceData } from "discord.js";
import { Command } from "../Command";
import { MateriaAprobada } from "../entities/Entities";
import { DatabaseConnection, MateriaOption } from "../DBConnection";
import { padron } from './LogIn';

let materiasYaMostradas: MateriaOption[] = []
let materiasParticiones: MateriaOption[][] = [];

export async function loadMateriaParticiones() {
  let materias = await DatabaseConnection.getAllMaterias();
  console.log(materias);
  const result: MateriaOption[][] = [];
  let sizeParticion = 24;
  let lengthMaterias = materias.length;
  for (let i = 0; i < lengthMaterias; i += sizeParticion) {
    result.push(materias.slice(i, i + sizeParticion));
  }
  materiasParticiones = result;
}

export async function createMateriasAprobada(): Promise<Command> {

  const particion: MateriaOption[] = materiasParticiones.at(0)!;
  console.log(particion);
  // materiasYaMostradas.push(...particion!);

  particion.push({ name: "Mostrar más", value: "Mostrar más" });

  const MateriasAprobadas: Command = {
    name: "materias-aprobada",
    description: "Registra tus materias aprobadas",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "materias-aprobada",
        description: "materia aprobada",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: particion,
      }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
      if (!padron) {
        await interaction.followUp("Debe loguearse primero. use /login <padron>");
        return;
      }
      const materiaOption = interaction.options.get("materia-aprobada");
      if (materiaOption) {
        const nombreMateria = materiaOption.value as string;
        const materiaAprobada = new MateriaAprobada();
        const codigoMateria = await DatabaseConnection.getCodigoMateriaPorNombre(nombreMateria);
        if (codigoMateria) {
          materiaAprobada.materiaCodigo = codigoMateria;
          materiaAprobada.alumnoPadron = padron;
          DatabaseConnection.saveMateriaAprobada(materiaAprobada);
        }

        await interaction.followUp({
          content: `Tu materia aprobada se ha guardado exitosamente.`,
          ephemeral: true
        });
      }
    }
  }
  return await MateriasAprobadas;
}

