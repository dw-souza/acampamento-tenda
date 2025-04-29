
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Member {
  id: string;
  full_name: string;
  birth_date: Date | null;
  marital_status: string | null;
  is_child: boolean;
  vai_acampamento: boolean;
}

interface FamilyMemberFormProps {
  member: Member;
  onUpdate: (member: Partial<Member>) => void;
  onRemove?: () => void;
  isChild?: boolean;
  showRemoveButton?: boolean;
}

const FamilyMemberForm = ({
  member,
  onUpdate,
  onRemove,
  isChild = false,
  showRemoveButton = false,
}: FamilyMemberFormProps) => {
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between mb-2">
        <h4 className="font-medium">{isChild ? "Filho" : "Adulto"}</h4>
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
          >
            Remover
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome Completo</label>
          <Input
            value={member.full_name}
            onChange={(e) => onUpdate({ full_name: e.target.value })}
            placeholder="Nome completo"
          />
        </div>

        {!isChild && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado Civil</label>
            <Select
              value={member.marital_status || ""}
              onValueChange={(value) => onUpdate({ marital_status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={member.vai_acampamento}
              onCheckedChange={(checked) => 
                onUpdate({ vai_acampamento: checked === true })
              }
            />
            <span>Vai ao acampamento</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberForm;
